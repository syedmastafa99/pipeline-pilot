import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, mimeType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!imageBase64) {
      throw new Error("No image data provided");
    }

    console.log("Processing passport image for OCR...");

    const systemPrompt = `You are a passport data extraction specialist. Analyze the provided passport image and extract all visible information accurately.

Extract the following fields if visible:
- passport_type: The type of passport (usually P, D, or S)
- country_code: 3-letter country code (e.g., BGD for Bangladesh)
- passport_number: The passport number
- surname: Family name/surname
- given_name: Given name(s)
- nationality: Full nationality name
- date_of_birth: Date of birth in YYYY-MM-DD format
- sex: M or F
- place_of_birth: Place of birth
- personal_number: Personal/National ID number if visible
- previous_passport_number: Previous passport number if visible
- passport_issue_date: Date of issue in YYYY-MM-DD format
- passport_expiry_date: Date of expiry in YYYY-MM-DD format
- issuing_authority: Issuing authority name
- father_name: Father's name if visible (usually on personal data page)
- mother_name: Mother's name if visible
- permanent_address: Permanent address if visible
- emergency_contact_name: Emergency contact name if visible
- emergency_contact_relationship: Relationship to emergency contact if visible
- emergency_contact_address: Emergency contact address if visible
- emergency_contact_phone: Emergency contact phone if visible

Return ONLY the extracted data. If a field is not visible or unclear, omit it from the response.`;

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
          { 
            role: "user", 
            content: [
              {
                type: "text",
                text: "Please extract all passport information from this image. Return the data as a function call."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`
                }
              }
            ]
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_passport_data",
              description: "Extract structured passport data from the analyzed image",
              parameters: {
                type: "object",
                properties: {
                  passport_type: { type: "string", description: "Type of passport (P, D, S)" },
                  country_code: { type: "string", description: "3-letter country code" },
                  passport_number: { type: "string", description: "Passport number" },
                  surname: { type: "string", description: "Family name/surname" },
                  given_name: { type: "string", description: "Given name(s)" },
                  nationality: { type: "string", description: "Full nationality" },
                  date_of_birth: { type: "string", description: "Date of birth (YYYY-MM-DD)" },
                  sex: { type: "string", description: "Sex (M or F)" },
                  place_of_birth: { type: "string", description: "Place of birth" },
                  personal_number: { type: "string", description: "Personal/National ID number" },
                  previous_passport_number: { type: "string", description: "Previous passport number" },
                  passport_issue_date: { type: "string", description: "Issue date (YYYY-MM-DD)" },
                  passport_expiry_date: { type: "string", description: "Expiry date (YYYY-MM-DD)" },
                  issuing_authority: { type: "string", description: "Issuing authority" },
                  father_name: { type: "string", description: "Father's name" },
                  mother_name: { type: "string", description: "Mother's name" },
                  permanent_address: { type: "string", description: "Permanent address" },
                  emergency_contact_name: { type: "string", description: "Emergency contact name" },
                  emergency_contact_relationship: { type: "string", description: "Relationship to emergency contact" },
                  emergency_contact_address: { type: "string", description: "Emergency contact address" },
                  emergency_contact_phone: { type: "string", description: "Emergency contact phone" },
                },
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_passport_data" } },
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

    const data = await response.json();
    console.log("AI response received:", JSON.stringify(data).slice(0, 500));

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall && toolCall.function?.arguments) {
      const extractedData = JSON.parse(toolCall.function.arguments);
      console.log("Extracted passport data:", extractedData);
      
      return new Response(JSON.stringify({ 
        success: true, 
        data: extractedData 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: try to parse content if no tool call
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      console.log("No tool call, returning content:", content);
      return new Response(JSON.stringify({ 
        success: true, 
        data: {},
        message: "Could not extract structured data. Please enter manually." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("No valid response from AI");
  } catch (error) {
    console.error("Passport OCR error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});