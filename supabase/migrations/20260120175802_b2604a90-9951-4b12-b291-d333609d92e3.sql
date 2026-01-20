-- Fix activity_logs RLS: Users see own logs, admins see all
DROP POLICY IF EXISTS "Authenticated users can view activity logs" ON activity_logs;

-- Users can view their own activity logs
CREATE POLICY "Users can view their own activity logs"
ON activity_logs FOR SELECT
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'admin')
);