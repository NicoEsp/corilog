
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ensureUserHasRole } from '@/services/roleService';
import { logError } from '@/utils/errorHandling';

export type UserRole = 'superadmin' | 'free' | 'premium';

interface RoleContextType {
  role: UserRole | null;
  loading: boolean;
  hasRole: (requiredRole: UserRole) => boolean;
  canAccessFeature: (feature: 'list' | 'timeline' | 'future-letter' | 'ebook') => boolean;
  isPremium: boolean;
  isSuperAdmin: boolean;
  isFree: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

export const RoleProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const isProcessingRole = useRef(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        isProcessingRole.current = false;
        return;
      }

      // Evitar múltiples llamadas simultáneas
      if (isProcessingRole.current) {
        return;
      }

      isProcessingRole.current = true;
      setLoading(true);

      try {
        console.log(`Obteniendo rol para usuario ${user.id} con email ${user.email}`);
        
        const userRole = await ensureUserHasRole(user.id, user.email || '');
        
        if (userRole) {
          setRole(userRole);
          console.log(`Rol obtenido/asignado: ${userRole}`);
        } else {
          console.log('Fallback a rol free');
          setRole('free');
        }
      } catch (error) {
        logError(error, 'fetch_user_role_general');
        console.log('Error obteniendo rol, usando fallback free');
        setRole('free');
      } finally {
        setLoading(false);
        isProcessingRole.current = false;
      }
    };

    fetchUserRole();
  }, [user?.id]); // Solo depende del ID del usuario

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

  const value = {
    role,
    loading,
    hasRole,
    canAccessFeature,
    isPremium: role === 'premium',
    isSuperAdmin: role === 'superadmin',
    isFree: role === 'free'
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};
