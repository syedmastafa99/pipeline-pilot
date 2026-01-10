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
  file_url: string | null;
  file_name: string | null;
}

export interface DocumentChecklistItem extends StageDocument {
  is_completed: boolean;
  completed_at: string | null;
  notes: string | null;
  candidate_document_id: string | null;
  file_url: string | null;
  file_name: string | null;
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
          file_url: candidateDoc?.file_url ?? null,
          file_name: candidateDoc?.file_name ?? null,
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

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      candidateId,
      stageDocumentId,
      candidateDocumentId,
      file,
    }: {
      candidateId: string;
      stageDocumentId: string;
      candidateDocumentId: string | null;
      file: File;
    }) => {
      // Upload file to storage
      const fileExt = file.name.split(".").pop();
      const filePath = `${candidateId}/${stageDocumentId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("candidate-documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("candidate-documents")
        .getPublicUrl(filePath);

      const file_url = urlData.publicUrl;

      if (candidateDocumentId) {
        // Update existing record
        const { error } = await supabase
          .from("candidate_documents")
          .update({
            file_url: filePath,
            file_name: file.name,
          })
          .eq("id", candidateDocumentId);

        if (error) throw error;
      } else {
        // Insert new record with file
        const { error } = await supabase.from("candidate_documents").insert({
          candidate_id: candidateId,
          stage_document_id: stageDocumentId,
          is_completed: false,
          file_url: filePath,
          file_name: file.name,
        });

        if (error) throw error;
      }

      return filePath;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate-documents"] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      candidateDocumentId,
      filePath,
    }: {
      candidateDocumentId: string;
      filePath: string;
    }) => {
      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from("candidate-documents")
        .remove([filePath]);

      if (deleteError) throw deleteError;

      // Update database record
      const { error } = await supabase
        .from("candidate_documents")
        .update({
          file_url: null,
          file_name: null,
        })
        .eq("id", candidateDocumentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate-documents"] });
    },
  });
}

export function useGetSignedUrl() {
  return useMutation({
    mutationFn: async (filePath: string) => {
      const { data, error } = await supabase.storage
        .from("candidate-documents")
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) throw error;
      return data.signedUrl;
    },
  });
}
