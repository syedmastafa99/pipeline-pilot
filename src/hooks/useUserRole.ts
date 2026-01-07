import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useUserRole() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setIsApproved(false);
      setLoading(false);
      return;
    }

    const checkUserStatus = async () => {
      try {
        // Check if user is admin
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        setIsAdmin(!!roleData);

        // Check if user is approved
        const { data: profileData } = await supabase
          .from('profiles')
          .select('is_approved')
          .eq('id', user.id)
          .maybeSingle();

        setIsApproved(profileData?.is_approved ?? false);
      } catch (error) {
        console.error('Error checking user status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserStatus();
  }, [user]);

  return { isAdmin, isApproved, loading };
}
