
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useSharedMomentsCount = () => {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSharedMomentsCount();
    }
  }, [user]);

  const fetchSharedMomentsCount = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { count: sharedCount, error } = await supabase
        .from('shared_moments')
        .select('*', { count: 'exact', head: true })
        .eq('shared_by_user_id', user.id);

      if (error) {
        console.error('Error fetching shared moments count:', error);
        setCount(0);
      } else {
        setCount(sharedCount || 0);
      }
    } catch (error) {
      console.error('Error fetching shared moments count:', error);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  return { count, loading };
};
