-- Add medical_fit_date and medical_expiry_date columns to candidates table
ALTER TABLE public.candidates 
ADD COLUMN medical_fit_date DATE,
ADD COLUMN medical_expiry_date DATE;