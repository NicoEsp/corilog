import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useCallback } from 'react';
import { APP_CONFIG } from '@/config/constants';

/**
 * Hook optimizado para queries con prefetching inteligente
 * Mejora los tiempos de carga sin afectar funcionalidades
 */
export const useOptimizedQueries = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Prefetch inteligente de datos críticos
  const prefetchCriticalData = useCallback(async () => {
    if (!user?.id) return;

    // Prefetch streak data si no está en cache
    const streakCacheKey = ['streakData', user.id];
    if (!queryClient.getQueryData(streakCacheKey)) {
      queryClient.prefetchQuery({
        queryKey: streakCacheKey,
        staleTime: APP_CONFIG.PREFETCH_TIME,
      });
    }

    // Prefetch user stats si no está en cache
    const statsCacheKey = ['userStats', user.id];
    if (!queryClient.getQueryData(statsCacheKey)) {
      queryClient.prefetchQuery({
        queryKey: statsCacheKey,
        staleTime: APP_CONFIG.PREFETCH_TIME,
      });
    }
  }, [user?.id, queryClient]);

  // Background refetch optimizado
  const optimizeBackgroundRefetch = useCallback(() => {
    if (!user?.id) return;

    // Solo hacer refetch si los datos están antiguos
    const momentsQuery = queryClient.getQueryState(['moments', user.id]);
    if (momentsQuery && momentsQuery.dataUpdatedAt < Date.now() - APP_CONFIG.QUERY_STALE_TIME) {
      queryClient.invalidateQueries({ 
        queryKey: ['moments', user.id],
        refetchType: 'none' // No bloquear UI
      });
    }
  }, [user?.id, queryClient]);

  // Ejecutar prefetch en focus/visibilitychange
  useEffect(() => {
    const handleFocus = () => {
      prefetchCriticalData();
      // Delay para no sobrecargar en el momento del focus
      setTimeout(optimizeBackgroundRefetch, 1000);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        handleFocus();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Prefetch inicial
    if (user?.id) {
      setTimeout(prefetchCriticalData, 500);
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [prefetchCriticalData, optimizeBackgroundRefetch, user?.id]);

  // Cache warming para mejores transiciones
  const warmCache = useCallback((keys: string[][]) => {
    keys.forEach(key => {
      queryClient.prefetchQuery({
        queryKey: key,
        staleTime: APP_CONFIG.QUERY_STALE_TIME,
      });
    });
  }, [queryClient]);

  return {
    prefetchCriticalData,
    optimizeBackgroundRefetch,
    warmCache,
  };
};