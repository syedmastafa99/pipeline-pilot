import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Validate user authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create client with user's token to verify authentication
    const token = authHeader.replace("Bearer ", "");
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });
    
    // Verify the user is authenticated
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(token);
    
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(JSON.stringify({ error: "Unauthorized - invalid or expired token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user is approved
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
    const { data: profile } = await supabaseService
      .from('profiles')
      .select('is_approved')
      .eq('id', user.id)
      .single();
    
    if (!profile?.is_approved) {
      return new Response(JSON.stringify({ error: "Account not approved" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user is admin
    const { data: isAdmin } = await supabaseService.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    // Fetch current pipeline data for context - SCOPED TO USER'S DATA
    let candidatesQuery = supabaseService
      .from('candidates')
      .select('*')
      .order('updated_at', { ascending: false });

    let tasksQuery = supabaseService
      .from('agency_tasks')
      .select('*')
      .order('due_date', { ascending: true });

    let reportsQuery = supabaseService
      .from('daily_reports')
      .select('*')
      .order('report_date', { ascending: false })
      .limit(7);

    // If not admin, filter by user_id
    if (!isAdmin) {
      candidatesQuery = candidatesQuery.eq('user_id', user.id);
      tasksQuery = tasksQuery.eq('user_id', user.id);
      reportsQuery = reportsQuery.eq('user_id', user.id);
    }

    const { data: candidates } = await candidatesQuery;
    const { data: tasks } = await tasksQuery;
    const { data: recentReports } = await reportsQuery;

    // Calculate pipeline statistics
    const stageCount: Record<string, number> = {};
    const stages = [
      'passport_received', 'medical', 'police_clearance', 'interview',
      'mofa', 'taseer', 'takamul', 'training', 'fingerprint', 'visa_issued', 'flight'
    ];
    
    stages.forEach(stage => { stageCount[stage] = 0; });
    candidates?.forEach(c => {
      if (stageCount[c.current_stage] !== undefined) {
        stageCount[c.current_stage]++;
      }
    });

    // Find bottlenecks (stages with most candidates)
    const sortedStages = Object.entries(stageCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    const pendingTasks = tasks?.filter(t => t.status !== 'completed') || [];
    const urgentTasks = pendingTasks.filter(t => t.priority === 'urgent');

    const dataScope = isAdmin ? "all users" : "your account";

    const systemPrompt = `You are RecruitFlow AI, an intelligent assistant for a recruitment agency tracking system. You help with:
- Answering questions about candidates in the pipeline
- Generating report summaries
- Identifying pipeline bottlenecks and providing insights
- Suggesting optimizations for the recruitment workflow

Note: You are showing data for ${dataScope}.

Current Pipeline Statistics:
- Total Candidates: ${candidates?.length || 0}
${Object.entries(stageCount).map(([stage, count]) => `- ${stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${count} candidates`).join('\n')}

Top Bottleneck Stages (most candidates waiting):
${sortedStages.map(([stage, count]) => `- ${stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${count} candidates`).join('\n')}

Task Overview:
- Total Pending Tasks: ${pendingTasks.length}
- Urgent Tasks: ${urgentTasks.length}

Recent Candidates (last 10):
${candidates?.slice(0, 10).map(c => `- ${c.full_name} (${c.current_stage.replace(/_/g, ' ')}) - ${c.destination_country || 'No destination'}`).join('\n') || 'No candidates yet'}

Recent Reports Summary:
${recentReports?.map(r => `- ${r.report_date}: ${r.total_candidates} total, ${r.new_candidates} new, ${r.visas_issued} visas issued`).join('\n') || 'No reports yet'}

Be helpful, concise, and provide actionable insights. When discussing bottlenecks, suggest specific actions to improve flow. Format responses with markdown for readability.`;

    console.log('Sending request to AI gateway with authenticated context for user:', user.email);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI assistant error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
