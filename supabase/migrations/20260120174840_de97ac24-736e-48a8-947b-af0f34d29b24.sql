-- Fix 1: candidate_documents RLS - Drop permissive policies and create ownership-based policies
DROP POLICY IF EXISTS "Users can view candidate documents" ON candidate_documents;
DROP POLICY IF EXISTS "Users can insert candidate documents" ON candidate_documents;
DROP POLICY IF EXISTS "Users can update candidate documents" ON candidate_documents;

-- Create policies that verify candidate ownership
CREATE POLICY "Users can view their candidate documents"
ON candidate_documents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM candidates
    WHERE candidates.id = candidate_documents.candidate_id
    AND candidates.user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can insert their candidate documents"
ON candidate_documents FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM candidates
    WHERE candidates.id = candidate_documents.candidate_id
    AND candidates.user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can update their candidate documents"
ON candidate_documents FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM candidates
    WHERE candidates.id = candidate_documents.candidate_id
    AND candidates.user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin')
);

-- Add delete policy for completeness
CREATE POLICY "Users can delete their candidate documents"
ON candidate_documents FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM candidates
    WHERE candidates.id = candidate_documents.candidate_id
    AND candidates.user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin')
);

-- Fix 2: Storage bucket policies - Drop and recreate with ownership verification
DROP POLICY IF EXISTS "Users can upload their own candidate documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own candidate documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own candidate documents" ON storage.objects;

-- Create ownership-based storage policies (folder structure: candidateId/...)
CREATE POLICY "Users can upload to their candidates storage"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'candidate-documents'
  AND auth.uid() IS NOT NULL
  AND (
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM candidates WHERE user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "Users can view their candidates storage"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'candidate-documents'
  AND auth.uid() IS NOT NULL
  AND (
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM candidates WHERE user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "Users can update their candidates storage"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'candidate-documents'
  AND auth.uid() IS NOT NULL
  AND (
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM candidates WHERE user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "Users can delete their candidates storage"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'candidate-documents'
  AND auth.uid() IS NOT NULL
  AND (
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM candidates WHERE user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin')
  )
);