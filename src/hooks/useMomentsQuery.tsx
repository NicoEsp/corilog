
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { useAuth } from '@/contexts/AuthContext';
import { Moment } from '@/types/moment';

export const useMomentsQuery = () => {
  const { user, session, forceRefresh } = useAuth();
  
  return useQuery({
    queryKey: ['moments', user?.id],
    queryFn: async (): Promise<Moment[]> => {
      if (!user || !session) {
        logger.info('No user or session available for moments query', 'useMomentsQuery');
        return [];
      }

      try {
        logger.debug('Fetching moments for user', 'useMomentsQuery', { userId: user.id });
        
        const { data: moments, error } = await supabase
          .from('moments')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (error) {
          // Verificar si es un error de autenticación
          if (error.message?.includes('JWT') || 
              error.message?.includes('token') || 
              error.message?.includes('auth')) {
            logger.error('Auth error in moments query, attempting refresh', 'useMomentsQuery', error);
            
            // Intentar refrescar la sesión
            try {
              await forceRefresh();
              // No hacer retry aquí, React Query se encargará
              throw error;
            } catch (refreshError) {
              logger.error('Failed to refresh session for moments query', 'useMomentsQuery', refreshError);
              throw error;
            }
          }
          
          logger.error('Error fetching moments', 'useMomentsQuery', error);
          throw error;
        }

        logger.debug('Successfully fetched moments', 'useMomentsQuery', { 
          count: moments?.length || 0 
        });
        
        // Convert string dates to Date objects
        const formattedMoments = (moments || []).map(moment => ({
          ...moment,
          date: new Date(moment.date)
        }));
        
        return formattedMoments;
      } catch (error) {
        logger.error('General error in moments query', 'useMomentsQuery', error);
        throw error;
      }
    },
    enabled: !!user && !!session,
    retry: (failureCount, error: any) => {
      // Retry automático para errores de red, pero no para errores de auth
      if (error?.message?.includes('JWT') || 
          error?.message?.includes('token') || 
          error?.message?.includes('auth')) {
        return failureCount < 2; // Solo 2 intentos para errores de auth
      }
      return failureCount < 3; // 3 intentos para otros errores
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 1000 * 60 * 2, // 2 minutos
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};
