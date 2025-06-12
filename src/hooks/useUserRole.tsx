
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logError } from '@/utils/errorHandling';

export type UserRole = 'superadmin' | 'free' | 'premium';

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .rpc('get_user_role', { user_id: user.id });

        if (error) {
          logError(error, 'fetch_user_role');
          // Fallback a 'free' si hay error
          setRole('free');
        } else {
          setRole(data as UserRole);
        }
      } catch (error) {
        logError(error, 'fetch_user_role_general');
        setRole('free');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const hasRole = (requiredRole: UserRole): boolean => {
    if (!role) return false;
    
    // Superadmin tiene acceso a todo
    if (role === 'superadmin') return true;
    
    // Premium tiene acceso a free y premium
    if (role === 'premium' && (requiredRole === 'free' || requiredRole === 'premium')) {
      return true;
    }
    
    // Free solo tiene acceso a free
    return role === requiredRole;
  };

  const canAccessFeature = (feature: 'list' | 'timeline' | 'future-letter' | 'ebook'): boolean => {
    if (!role) return false;
    
    switch (feature) {
      case 'list':
      case 'timeline':
        return hasRole('free'); // Disponible para todos los usuarios registrados
      case 'future-letter':
      case 'ebook':
        return hasRole('premium'); // Solo para premium y superadmin
      default:
        return false;
    }
  };

  return {
    role,
    loading,
    hasRole,
    canAccessFeature,
    isPremium: role === 'premium',
    isSuperAdmin: role === 'superadmin',
    isFree: role === 'free'
  };
};
