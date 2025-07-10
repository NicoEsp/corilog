
import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { ROUTES } from '@/config/constants';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Clean up auth state utility - memoizado
const cleanupAuthState = (() => {
  let cleanupFn: (() => void) | null = null;
  
  return () => {
    if (cleanupFn) return cleanupFn();
    
    cleanupFn = () => {
      try {
        // Remove all Supabase auth keys from localStorage
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
            localStorage.removeItem(key);
          }
        });
        
        // Remove from sessionStorage if available
        if (typeof sessionStorage !== 'undefined') {
          Object.keys(sessionStorage).forEach((key) => {
            if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
              sessionStorage.removeItem(key);
            }
          });
        }
        } catch (error) {
          logger.error('Error during auth cleanup', 'cleanup_auth_state', error);
        }
    };
    
    cleanupFn();
  };
})();

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Memoizar signOut para evitar recreación en cada render
  const signOut = useCallback(async () => {
    try {
      // Clean up auth state first
      cleanupAuthState();
      
      // Attempt global sign out
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        logger.error('Error signing out', 'sign_out', error);
      }
      
      // Force page reload for clean state
      window.location.href = ROUTES.AUTH;
    } catch (error) {
      logger.error('General error during sign out', 'sign_out_general', error);
      
      // Force cleanup and redirect even if signOut fails
      cleanupAuthState();
      window.location.href = ROUTES.AUTH;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Configurar listener de cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        logger.info('Auth state change', 'AuthContext', { event });
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle specific auth events
        if (event === 'SIGNED_OUT') {
          cleanupAuthState();
        } else if (event === 'TOKEN_REFRESHED') {
          logger.info('Token refreshed successfully', 'AuthContext');
        } else if (event === 'SIGNED_IN' && session?.user) {
          logger.info('User signed in', 'AuthContext', { email: session.user.email });
        }
      }
    );

    // Verificar sesión existente
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          logger.error('Error getting session', 'get_session', error);
        }
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        logger.error('Error checking session', 'check_session', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Memoizar el value para evitar re-renders innecesarios
  const value = useMemo(() => ({
    user,
    session,
    loading,
    signOut,
  }), [user, session, loading, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
