-- Create activity_logs table to track all data modifications
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view logs
CREATE POLICY "Authenticated users can view activity logs"
ON public.activity_logs
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to create logs
CREATE POLICY "Authenticated users can create activity logs"
ON public.activity_logs
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Create index for faster queries
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_table_name ON public.activity_logs(table_name);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);