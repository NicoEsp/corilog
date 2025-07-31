
import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { ROUTES } from '@/config/constants';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isReconnecting: boolean;
  signOut: () => Promise<void>;
  forceRefresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Clean up auth state utility - menos agresivo
const cleanupAuthState = (manual = false) => {
  try {
    if (manual) {
      // Solo en logout manual, limpieza completa
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-') || key === 'corilog-auth') {
          localStorage.removeItem(key);
        }
      });
      logger.info('Manual auth cleanup completed', 'cleanup_auth_state');
    } else {
      // En errores, preservar sesiones válidas
      logger.info('Preserving auth state due to temporary error', 'cleanup_auth_state');
    }
  } catch (error) {
    logger.error('Error during auth cleanup', 'cleanup_auth_state', error);
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Memoizar signOut para evitar recreación en cada render
  const signOut = useCallback(async () => {
    try {
      logger.info('Manual sign out initiated', 'AuthContext');
      
      // Clean up auth state first (manual = true)
      cleanupAuthState(true);
      
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
      cleanupAuthState(true);
      window.location.href = ROUTES.AUTH;
    }
  }, []);

  // Función para forzar actualización de sesión
  const forceRefresh = useCallback(async () => {
    try {
      setIsReconnecting(true);
      logger.info('Forcing session refresh', 'AuthContext');
      
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        logger.error('Error refreshing session', 'force_refresh', error);
        throw error;
      }
      
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        setRetryCount(0);
        logger.info('Session refreshed successfully', 'AuthContext');
      }
    } catch (error) {
      logger.error('Failed to refresh session', 'force_refresh_error', error);
      
      // Si falla el refresh, intentar obtener sesión existente
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          setSession(sessionData.session);
          setUser(sessionData.session.user);
        }
      } catch (sessionError) {
        logger.error('Failed to get existing session', 'get_session_fallback', sessionError);
      }
    } finally {
      setIsReconnecting(false);
    }
  }, []);

  // Retry automático para errores de token
  const handleAuthError = useCallback(async (error: any, context: string) => {
    logger.error(`Auth error in ${context}`, 'auth_error', error);
    
    if (retryCount < 3 && (
      error?.message?.includes('JWT') || 
      error?.message?.includes('token') ||
      error?.message?.includes('refresh')
    )) {
      setRetryCount(prev => prev + 1);
      logger.info(`Attempting auth retry ${retryCount + 1}/3`, 'AuthContext');
      
      setTimeout(() => {
        forceRefresh();
      }, 1000 * retryCount); // Backoff exponencial
    } else if (retryCount >= 3) {
      logger.error('Max auth retries reached, signing out', 'AuthContext');
      setRetryCount(0);
      // No hacer logout automático, solo limpiar estado local
      setSession(null);
      setUser(null);
    }
  }, [retryCount, forceRefresh]);

  useEffect(() => {
    let mounted = true;

    // Configurar listener de cambios de autenticación con mejor manejo de errores
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        logger.info('🔐 Auth state change', 'AuthContext', { 
          event, 
          hasSession: !!session,
          userId: session?.user?.id,
          provider: session?.user?.app_metadata?.provider || 'unknown'
        });
        
        try {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          setIsReconnecting(false);
          setRetryCount(0); // Reset retry count on successful auth change

          // Handle specific auth events
          if (event === 'SIGNED_OUT') {
            // Solo limpiar en logout manual, no automático
            if (!session) {
              logger.info('👋 User signed out', 'AuthContext');
              cleanupAuthState(false); // No manual cleanup
            }
          } else if (event === 'TOKEN_REFRESHED') {
            logger.info('🔄 Token refreshed successfully', 'AuthContext', {
              expiresAt: session?.expires_at ? new Date(session.expires_at * 1000) : null
            });
          } else if (event === 'SIGNED_IN' && session?.user) {
            const provider = session.user.app_metadata?.provider || 'unknown';
            logger.info('✅ User signed in', 'AuthContext', { 
              email: session.user.email,
              provider: provider,
              via_oauth: provider === 'google',
              expiresAt: session?.expires_at ? new Date(session.expires_at * 1000) : null
            });

            // Para Google OAuth, forzar invalidación y refetch específico de momentos
            if (provider === 'google') {
              logger.info('🔗 OAuth sign-in detected, forcing moments refetch', 'AuthContext');
              setTimeout(() => {
                // Importar queryClient en el callback para evitar dependencies
                import('@/lib/queryClient').then(({ queryClient }) => {
                  // Refetch específico de momentos con retry logic
                  queryClient.refetchQueries({ 
                    queryKey: ['moments', session.user.id],
                    type: 'active'
                  }).catch((error) => {
                    logger.error('Failed to refetch moments after Google auth', 'google_auth_refetch', error);
                    // Retry una vez más después de 1 segundo
                    setTimeout(() => {
                      queryClient.refetchQueries({ 
                        queryKey: ['moments', session.user.id],
                        type: 'active'
                      });
                    }, 1000);
                  });
                  
                  // También refetch datos críticos
                  queryClient.refetchQueries({ 
                    queryKey: ['streakData', session.user.id],
                    type: 'active'
                  });
                  queryClient.refetchQueries({ 
                    queryKey: ['userStats', session.user.id],
                    type: 'active'
                  });
                });
              }, 500); // Aumentado a 500ms para mejor timing
            }
          }
        } catch (error) {
          logger.error('💥 Error in auth state change handler', 'auth_state_change', error);
          handleAuthError(error, 'onAuthStateChange');
        }
      }
    );

    // Verificar sesión existente con mejor manejo de errores
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          logger.error('Error getting session', 'get_session', error);
          handleAuthError(error, 'getSession');
        } else {
          if (mounted) {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
            
            if (session) {
              logger.info('Existing session found', 'AuthContext', {
                userId: session.user.id,
                expiresAt: session.expires_at ? new Date(session.expires_at * 1000) : null
              });
            }
          }
        }
      } catch (error) {
        logger.error('Error checking session', 'check_session', error);
        if (mounted) {
          setLoading(false);
          handleAuthError(error, 'checkSession');
        }
      }
    };

    checkSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [handleAuthError]);

  // Memoizar el value para evitar re-renders innecesarios
  const value = useMemo(() => ({
    user,
    session,
    loading,
    isReconnecting,
    signOut,
    forceRefresh,
  }), [user, session, loading, isReconnecting, signOut, forceRefresh]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
