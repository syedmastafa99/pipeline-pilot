-- Add height, weight, and certificate columns to candidates table
ALTER TABLE public.candidates 
ADD COLUMN height TEXT,
ADD COLUMN weight TEXT,
ADD COLUMN certificate TEXT;