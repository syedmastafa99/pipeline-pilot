-- Create table for stage document requirements (predefined checklist items per stage)
CREATE TABLE public.stage_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stage TEXT NOT NULL,
  document_name TEXT NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for tracking candidate document completion
CREATE TABLE public.candidate_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  stage_document_id UUID NOT NULL REFERENCES public.stage_documents(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(candidate_id, stage_document_id)
);

-- Enable RLS
ALTER TABLE public.stage_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for stage_documents (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view stage documents"
ON public.stage_documents FOR SELECT
TO authenticated
USING (true);

-- RLS policies for candidate_documents
CREATE POLICY "Users can view candidate documents"
ON public.candidate_documents FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert candidate documents"
ON public.candidate_documents FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update candidate documents"
ON public.candidate_documents FOR UPDATE
TO authenticated
USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_candidate_documents_updated_at
BEFORE UPDATE ON public.candidate_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default document requirements for each stage
INSERT INTO public.stage_documents (stage, document_name, description, is_required, display_order) VALUES
-- Passport Received
('passport_received', 'Valid Passport', 'Original passport with at least 6 months validity', true, 1),
('passport_received', 'Passport Photos', '6 passport-sized photos with white background', true, 2),
('passport_received', 'National ID Copy', 'Copy of national identification card', true, 3),

-- Interview
('interview', 'CV/Resume', 'Updated curriculum vitae', true, 1),
('interview', 'Education Certificates', 'Academic qualification documents', true, 2),
('interview', 'Work Experience Letters', 'Previous employment references', false, 3),

-- Medical
('medical', 'Medical Report', 'Complete medical examination report', true, 1),
('medical', 'Blood Test Results', 'HIV, Hepatitis B/C, and other required tests', true, 2),
('medical', 'X-Ray Report', 'Chest X-ray clearance', true, 3),
('medical', 'Vaccination Record', 'Required vaccinations certificate', false, 4),

-- Police Clearance
('police_clearance', 'Police Clearance Certificate', 'Original PCC from home country', true, 1),
('police_clearance', 'Character Reference', 'Character reference letters', false, 2),

-- MOFA
('mofa', 'MOFA Attestation', 'Ministry of Foreign Affairs attestation', true, 1),
('mofa', 'Contract Copy', 'Attested employment contract', true, 2),

-- Taseer
('taseer', 'Taseer Approval', 'Taseer system registration approval', true, 1),
('taseer', 'Biometric Data', 'Biometric registration confirmation', true, 2),

-- Takamul
('takamul', 'Takamul Registration', 'Takamul system registration', true, 1),
('takamul', 'Skills Certificate', 'Certified skills assessment', false, 2),

-- Training
('training', 'Training Completion Certificate', 'Pre-departure training certificate', true, 1),
('training', 'Cultural Orientation', 'Cultural awareness training completion', true, 2),

-- Fingerprint
('fingerprint', 'Fingerprint Clearance', 'Fingerprint verification clearance', true, 1),

-- Embassy
('embassy', 'Embassy Appointment Confirmation', 'Scheduled embassy interview', true, 1),
('embassy', 'Visa Application Form', 'Completed visa application', true, 2),
('embassy', 'Supporting Documents Package', 'All required supporting documents', true, 3),

-- Visa Issued
('visa_issued', 'Visa Stamp/Sticker', 'Approved visa in passport', true, 1),
('visa_issued', 'Visa Copy', 'Photocopy of issued visa', true, 2),

-- Manpower
('manpower', 'Manpower Clearance', 'Manpower office clearance', true, 1),
('manpower', 'Exit Permit', 'Exit permit if required', false, 2),

-- Flight
('flight', 'Flight Ticket', 'Confirmed flight booking', true, 1),
('flight', 'Travel Insurance', 'Travel insurance certificate', true, 2),
('flight', 'Airport Instructions', 'Departure instructions provided', true, 3);