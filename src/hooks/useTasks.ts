import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logActivity } from './useActivityLogs';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date: string | null;
  assigned_to: string | null;
  related_candidate_id: string | null;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  assigned_to?: string;
  related_candidate_id?: string;
}

export const useTasks = () => {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agency_tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Task[];
    },
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to create a task');
      
      const { data, error } = await supabase
        .from('agency_tasks')
        .insert([{ ...input, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Log activity
      await logActivity({
        action: 'create',
        table_name: 'agency_tasks',
        record_id: data.id,
        new_data: JSON.parse(JSON.stringify(data)),
        description: `Created task: ${data.title}`,
      });
      
      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create task: ${error.message}`);
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
      // Get old data first
      const { data: oldData } = await supabase
        .from('agency_tasks')
        .select('*')
        .eq('id', id)
        .single();
      
      const { data, error } = await supabase
        .from('agency_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Log activity
      await logActivity({
        action: 'update',
        table_name: 'agency_tasks',
        record_id: id,
        old_data: JSON.parse(JSON.stringify(oldData)),
        new_data: JSON.parse(JSON.stringify(data)),
        description: `Updated task: ${data.title}`,
      });
      
      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update task: ${error.message}`);
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Get old data first
      const { data: oldData } = await supabase
        .from('agency_tasks')
        .select('*')
        .eq('id', id)
        .single();
      
      const { error } = await supabase
        .from('agency_tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Log activity
      if (oldData) {
        await logActivity({
          action: 'delete',
          table_name: 'agency_tasks',
          record_id: id,
          old_data: JSON.parse(JSON.stringify(oldData)),
          description: `Deleted task: ${oldData.title}`,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete task: ${error.message}`);
    },
  });
};
