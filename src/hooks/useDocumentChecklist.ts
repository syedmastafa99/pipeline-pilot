import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface StageDocument {
  id: string;
  stage: string;
  document_name: string;
  description: string | null;
  is_required: boolean;
  display_order: number;
}

interface CandidateDocument {
  id: string;
  candidate_id: string;
  stage_document_id: string;
  is_completed: boolean;
  completed_at: string | null;
  notes: string | null;
}

export interface DocumentChecklistItem extends StageDocument {
  is_completed: boolean;
  completed_at: string | null;
  notes: string | null;
  candidate_document_id: string | null;
}

export function useStageDocuments(stage: string) {
  return useQuery({
    queryKey: ["stage-documents", stage],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stage_documents")
        .select("*")
        .eq("stage", stage)
        .order("display_order");

      if (error) throw error;
      return data as StageDocument[];
    },
    enabled: !!stage,
  });
}

export function useCandidateDocuments(candidateId: string, stage: string) {
  return useQuery({
    queryKey: ["candidate-documents", candidateId, stage],
    queryFn: async () => {
      // Get stage documents
      const { data: stageDocuments, error: stageError } = await supabase
        .from("stage_documents")
        .select("*")
        .eq("stage", stage)
        .order("display_order");

      if (stageError) throw stageError;

      // Get candidate's completed documents for this stage
      const stageDocIds = stageDocuments.map((d) => d.id);
      const { data: candidateDocs, error: candError } = await supabase
        .from("candidate_documents")
        .select("*")
        .eq("candidate_id", candidateId)
        .in("stage_document_id", stageDocIds);

      if (candError) throw candError;

      // Merge the data
      const checklist: DocumentChecklistItem[] = stageDocuments.map((doc) => {
        const candidateDoc = candidateDocs?.find(
          (cd) => cd.stage_document_id === doc.id
        );
        return {
          ...doc,
          is_completed: candidateDoc?.is_completed ?? false,
          completed_at: candidateDoc?.completed_at ?? null,
          notes: candidateDoc?.notes ?? null,
          candidate_document_id: candidateDoc?.id ?? null,
        };
      });

      return checklist;
    },
    enabled: !!candidateId && !!stage,
  });
}

export function useToggleDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      candidateId,
      stageDocumentId,
      isCompleted,
      candidateDocumentId,
    }: {
      candidateId: string;
      stageDocumentId: string;
      isCompleted: boolean;
      candidateDocumentId: string | null;
    }) => {
      if (candidateDocumentId) {
        // Update existing record
        const { error } = await supabase
          .from("candidate_documents")
          .update({
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null,
          })
          .eq("id", candidateDocumentId);

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase.from("candidate_documents").insert({
          candidate_id: candidateId,
          stage_document_id: stageDocumentId,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
        });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate-documents"] });
    },
  });
}
