-- Add user_id column to candidates table for ownership
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to agency_tasks table for ownership
ALTER TABLE public.agency_tasks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to daily_reports table for ownership
ALTER TABLE public.daily_reports ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Allow all access to candidates" ON public.candidates;
DROP POLICY IF EXISTS "Allow all access to agency_tasks" ON public.agency_tasks;
DROP POLICY IF EXISTS "Allow all access to daily_reports" ON public.daily_reports;
DROP POLICY IF EXISTS "Allow all access to stage_history" ON public.stage_history;

-- Create RLS policies for candidates
CREATE POLICY "Users can view their own candidates" 
ON public.candidates FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own candidates" 
ON public.candidates FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own candidates" 
ON public.candidates FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own candidates" 
ON public.candidates FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for agency_tasks
CREATE POLICY "Users can view their own tasks" 
ON public.agency_tasks FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks" 
ON public.agency_tasks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" 
ON public.agency_tasks FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" 
ON public.agency_tasks FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for daily_reports
CREATE POLICY "Users can view their own reports" 
ON public.daily_reports FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reports" 
ON public.daily_reports FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports" 
ON public.daily_reports FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports" 
ON public.daily_reports FOR DELETE 
USING (auth.uid() = user_id);

-- Add user_id to stage_history for ownership tracking
ALTER TABLE public.stage_history ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create RLS policies for stage_history
CREATE POLICY "Users can view their own stage history" 
ON public.stage_history FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own stage history" 
ON public.stage_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stage history" 
ON public.stage_history FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stage history" 
ON public.stage_history FOR DELETE 
USING (auth.uid() = user_id);