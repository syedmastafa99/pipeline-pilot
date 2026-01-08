import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useUserRole() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [checked, setChecked] = useState(false);
  const loading = !checked;

  useEffect(() => {
    // reset when user changes
    setChecked(false);

    if (!user) {
      setIsAdmin(false);
      setIsApproved(false);
      setChecked(true);
      return;
    }

    const checkUserStatus = async () => {
      try {
        const [{ data: isAdminData }, { data: isApprovedData }] = await Promise.all([
          supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' }),
          supabase.rpc('is_approved', { _user_id: user.id }),
        ]);

        setIsAdmin(Boolean(isAdminData));
        setIsApproved(Boolean(isApprovedData));
      } catch (error) {
        console.error('Error checking user status:', error);
        setIsAdmin(false);
        setIsApproved(false);
      } finally {
        // ensure other state updates land before consumers react
        setTimeout(() => setChecked(true), 0);
      }
    };

    checkUserStatus();
  }, [user]);

  return { isAdmin, isApproved, loading, checked };
}
