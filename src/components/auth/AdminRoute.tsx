import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/auth');
      return;
    }

    const checkAdminStatus = async () => {
      try {
        const { data } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin',
        });
        setIsAdmin(Boolean(data));
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setChecking(false);
      }
    };

    checkAdminStatus();
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!checking && isAdmin === false) {
      navigate('/');
    }
  }, [checking, isAdmin, navigate]);

  if (authLoading || checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
