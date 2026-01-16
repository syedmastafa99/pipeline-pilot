-- Add visa date fields to candidates table
ALTER TABLE public.candidates
ADD COLUMN visa_issue_date DATE,
ADD COLUMN visa_expiry_date DATE;