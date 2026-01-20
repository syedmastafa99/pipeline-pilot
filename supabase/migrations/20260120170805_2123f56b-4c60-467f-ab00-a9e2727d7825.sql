-- Create invitations table for team member invites
CREATE TABLE public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  invited_by uuid NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  token uuid NOT NULL DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(email, status) -- Prevent duplicate pending invites
);

-- Enable RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Admins can view all invitations
CREATE POLICY "Admins can view all invitations"
ON public.invitations FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can create invitations
CREATE POLICY "Admins can create invitations"
ON public.invitations FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Admins can update invitations
CREATE POLICY "Admins can update invitations"
ON public.invitations FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Admins can delete invitations
CREATE POLICY "Admins can delete invitations"
ON public.invitations FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Function to accept invitation and auto-approve user
CREATE OR REPLACE FUNCTION public.accept_invitation(_token uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _invitation RECORD;
BEGIN
  -- Find valid invitation
  SELECT * INTO _invitation
  FROM public.invitations
  WHERE token = _token
    AND status = 'pending'
    AND expires_at > now();
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Mark invitation as accepted
  UPDATE public.invitations
  SET status = 'accepted'
  WHERE id = _invitation.id;
  
  -- Auto-approve the user profile
  UPDATE public.profiles
  SET is_approved = true, status = 'approved'
  WHERE email = _invitation.email;
  
  -- Assign the role
  INSERT INTO public.user_roles (user_id, role)
  SELECT p.id, _invitation.role
  FROM public.profiles p
  WHERE p.email = _invitation.email
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN true;
END;
$$;