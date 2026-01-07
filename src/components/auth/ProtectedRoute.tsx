import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireApproval?: boolean;
}

export function ProtectedRoute({ children, requireApproval = true }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [checkingApproval, setCheckingApproval] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user && requireApproval) {
      checkApprovalStatus();
    } else if (user) {
      setCheckingApproval(false);
    }
  }, [user, authLoading, navigate, requireApproval]);

  const checkApprovalStatus = async () => {
    if (!user) return;

    try {
      // Check if user is admin
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      const userIsAdmin = !!roleData;
      setIsAdmin(userIsAdmin);

      // Admins bypass approval check
      if (userIsAdmin) {
        setIsApproved(true);
        setCheckingApproval(false);
        return;
      }

      // Check approval status for non-admins
      const { data: profileData } = await supabase
        .from('profiles')
        .select('is_approved')
        .eq('id', user.id)
        .maybeSingle();

      setIsApproved(profileData?.is_approved ?? false);
    } catch (error) {
      console.error('Error checking approval status:', error);
      setIsApproved(false);
    } finally {
      setCheckingApproval(false);
    }
  };

  useEffect(() => {
    if (!checkingApproval && requireApproval && isApproved === false && !isAdmin) {
      navigate('/pending-approval');
    }
  }, [checkingApproval, isApproved, isAdmin, requireApproval, navigate]);

  if (authLoading || checkingApproval) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requireApproval && !isApproved && !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
