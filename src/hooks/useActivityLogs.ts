import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface ActivityLog {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  table_name: string;
  record_id: string | null;
  old_data: Json | null;
  new_data: Json | null;
  description: string | null;
  created_at: string;
}

export interface CreateActivityLogInput {
  action: 'create' | 'update' | 'delete';
  table_name: string;
  record_id?: string;
  old_data?: Json;
  new_data?: Json;
  description?: string;
}

export const useActivityLogs = (tableName?: string) => {
  return useQuery({
    queryKey: ['activity-logs', tableName],
    queryFn: async () => {
      let query = supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (tableName) {
        query = query.eq('table_name', tableName);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as ActivityLog[];
    },
  });
};

export const useCreateActivityLog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateActivityLogInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in');
      
      const { data, error } = await supabase
        .from('activity_logs')
        .insert([{
          user_id: user.id,
          user_email: user.email || 'Unknown',
          action: input.action,
          table_name: input.table_name,
          record_id: input.record_id,
          old_data: input.old_data ?? null,
          new_data: input.new_data ?? null,
          description: input.description,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data as ActivityLog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
    },
  });
};

// Helper function to log activity without React hook context
export const logActivity = async (input: CreateActivityLogInput) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  
  await supabase.from('activity_logs').insert([{
    user_id: user.id,
    user_email: user.email || 'Unknown',
    action: input.action,
    table_name: input.table_name,
    record_id: input.record_id,
    old_data: input.old_data ?? null,
    new_data: input.new_data ?? null,
    description: input.description,
  }]);
};
