import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, startOfDay, endOfDay } from 'date-fns';

export interface DailyReport {
  id: string;
  report_date: string;
  total_candidates: number | null;
  new_candidates: number | null;
  stage_completions: number | null;
  visas_issued: number | null;
  flights_completed: number | null;
  summary: string | null;
  created_at: string;
}

export const useReports = () => {
  return useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_reports')
        .select('*')
        .order('report_date', { ascending: false })
        .limit(30);
      
      if (error) throw error;
      return data as DailyReport[];
    },
  });
};

export const useGenerateDailyReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (date: Date = new Date()) => {
      const reportDate = format(date, 'yyyy-MM-dd');
      const startOfDayISO = startOfDay(date).toISOString();
      const endOfDayISO = endOfDay(date).toISOString();
      
      // Get total candidates
      const { count: totalCandidates } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true });
      
      // Get new candidates today
      const { count: newCandidates } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfDayISO)
        .lte('created_at', endOfDayISO);
      
      // Get stage completions today
      const { count: stageCompletions } = await supabase
        .from('stage_history')
        .select('*', { count: 'exact', head: true })
        .gte('completed_at', startOfDayISO)
        .lte('completed_at', endOfDayISO);
      
      // Get visas issued (candidates at visa_issued stage)
      const { count: visasIssued } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true })
        .eq('current_stage', 'visa_issued');
      
      // Get flights completed
      const { count: flightsCompleted } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true })
        .eq('current_stage', 'flight');
      
      // Check if report exists for today
      const { data: existingReport } = await supabase
        .from('daily_reports')
        .select('id')
        .eq('report_date', reportDate)
        .maybeSingle();
      
      const reportData = {
        report_date: reportDate,
        total_candidates: totalCandidates || 0,
        new_candidates: newCandidates || 0,
        stage_completions: stageCompletions || 0,
        visas_issued: visasIssued || 0,
        flights_completed: flightsCompleted || 0,
      };
      
      if (existingReport) {
        const { data, error } = await supabase
          .from('daily_reports')
          .update(reportData)
          .eq('id', existingReport.id)
          .select()
          .single();
        
        if (error) throw error;
        return data as DailyReport;
      } else {
        const { data, error } = await supabase
          .from('daily_reports')
          .insert([reportData])
          .select()
          .single();
        
        if (error) throw error;
        return data as DailyReport;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Daily report generated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to generate report: ${error.message}`);
    },
  });
};
