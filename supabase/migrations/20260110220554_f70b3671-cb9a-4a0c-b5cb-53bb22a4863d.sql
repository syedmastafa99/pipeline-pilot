-- Create storage bucket for candidate documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('candidate-documents', 'candidate-documents', false);

-- Add file_url column to candidate_documents
ALTER TABLE public.candidate_documents
ADD COLUMN file_url TEXT,
ADD COLUMN file_name TEXT;

-- Storage policies for authenticated users
CREATE POLICY "Users can upload their own candidate documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'candidate-documents' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can view their own candidate documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'candidate-documents' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their own candidate documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'candidate-documents' 
  AND auth.uid() IS NOT NULL
);