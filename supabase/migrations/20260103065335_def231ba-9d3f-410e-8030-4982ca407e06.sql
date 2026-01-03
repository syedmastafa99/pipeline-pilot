-- Create enum for candidate stages
CREATE TYPE public.candidate_stage AS ENUM (
  'passport_received',
  'medical',
  'police_clearance',
  'interview',
  'mofa',
  'taseer',
  'takamul',
  'training',
  'fingerprint',
  'visa_issued',
  'flight'
);

-- Create candidates table
CREATE TABLE public.candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  passport_number TEXT,
  nationality TEXT,
  phone TEXT,
  email TEXT,
  current_stage candidate_stage NOT NULL DEFAULT 'passport_received',
  destination_country TEXT,
  employer TEXT,
  job_title TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stage history table for tracking progression
CREATE TABLE public.stage_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  stage candidate_stage NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Create daily reports table
CREATE TABLE public.daily_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_candidates INTEGER DEFAULT 0,
  new_candidates INTEGER DEFAULT 0,
  stage_completions INTEGER DEFAULT 0,
  visas_issued INTEGER DEFAULT 0,
  flights_completed INTEGER DEFAULT 0,
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tasks table for agency operations
CREATE TABLE public.agency_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  due_date DATE,
  assigned_to TEXT,
  related_candidate_id UUID REFERENCES public.candidates(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (public access for now, can add auth later)
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (will restrict with auth later)
CREATE POLICY "Allow all access to candidates" ON public.candidates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to stage_history" ON public.stage_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to daily_reports" ON public.daily_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to agency_tasks" ON public.agency_tasks FOR ALL USING (true) WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON public.candidates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agency_tasks_updated_at
  BEFORE UPDATE ON public.agency_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();