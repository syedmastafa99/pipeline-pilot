-- Add agent_name and ref_company columns to candidates table
ALTER TABLE public.candidates 
ADD COLUMN agent_name TEXT,
ADD COLUMN ref_company TEXT;