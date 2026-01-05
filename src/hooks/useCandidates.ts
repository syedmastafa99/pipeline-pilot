import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { StageKey } from '@/lib/constants';

export interface Candidate {
  id: string;
  full_name: string;
  passport_number: string | null;
  nationality: string | null;
  phone: string | null;
  email: string | null;
  current_stage: StageKey;
  destination_country: string | null;
  employer: string | null;
  job_title: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

export interface CreateCandidateInput {
  full_name: string;
  passport_number?: string;
  nationality?: string;
  phone?: string;
  email?: string;
  destination_country?: string;
  employer?: string;
  job_title?: string;
  notes?: string;
}

export interface StageHistory {
  id: string;
  candidate_id: string;
  stage: StageKey;
  completed_at: string;
  notes: string | null;
}

export const useCandidates = () => {
  return useQuery({
    queryKey: ['candidates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Candidate[];
    },
  });
};

export const useCandidate = (id: string) => {
  return useQuery({
    queryKey: ['candidate', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Candidate | null;
    },
    enabled: !!id,
  });
};

export const useCandidateStageHistory = (candidateId: string) => {
  return useQuery({
    queryKey: ['stage-history', candidateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stage_history')
        .select('*')
        .eq('candidate_id', candidateId)
        .order('completed_at', { ascending: true });
      
      if (error) throw error;
      return data as StageHistory[];
    },
    enabled: !!candidateId,
  });
};

export const useCreateCandidate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateCandidateInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to create a candidate');
      
      const { data, error } = await supabase
        .from('candidates')
        .insert([{ ...input, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data as Candidate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Candidate added successfully');
    },
    onError: (error) => {
      toast.error(`Failed to add candidate: ${error.message}`);
    },
  });
};

export const useUpdateCandidate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Candidate> & { id: string }) => {
      const { data, error } = await supabase
        .from('candidates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Candidate;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['candidate', data.id] });
      toast.success('Candidate updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update candidate: ${error.message}`);
    },
  });
};

export const useUpdateCandidateStage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: StageKey }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to update stage');
      
      const { data, error } = await supabase
        .from('candidates')
        .update({ current_stage: stage })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Also record in stage history with user_id
      await supabase
        .from('stage_history')
        .insert([{ candidate_id: id, stage, user_id: user.id }]);
      
      return data as Candidate;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['candidate', data.id] });
      queryClient.invalidateQueries({ queryKey: ['stage-history', data.id] });
      toast.success('Stage updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update stage: ${error.message}`);
    },
  });
};

export const useDeleteCandidate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('candidates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Candidate deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete candidate: ${error.message}`);
    },
  });
};

export const useBulkCreateCandidates = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (candidates: CreateCandidateInput[]) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to import candidates');
      
      const candidatesWithUserId = candidates.map(c => ({ ...c, user_id: user.id }));
      
      const { data, error } = await supabase
        .from('candidates')
        .insert(candidatesWithUserId)
        .select();
      
      if (error) throw error;
      return data as Candidate[];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success(`${data.length} candidates imported successfully`);
    },
    onError: (error) => {
      toast.error(`Failed to import candidates: ${error.message}`);
    },
  });
};
