-- Add rejection status to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Update existing approved profiles
UPDATE public.profiles 
SET status = CASE WHEN is_approved THEN 'approved' ELSE 'pending' END
WHERE status IS NULL OR status = 'pending';

-- Insert admin role for user syedranabd@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('1d957f71-0b82-4ad0-a6d3-b8d03803b4b2', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Update profile to approved for admin user
UPDATE public.profiles
SET is_approved = true, status = 'approved'
WHERE id = '1d957f71-0b82-4ad0-a6d3-b8d03803b4b2';

-- Add policy for admins to delete profiles (for rejection cleanup if needed)
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles" 
ON public.profiles 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));