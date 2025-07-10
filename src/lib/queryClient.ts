
import { QueryClient } from '@tanstack/react-query';
import { APP_CONFIG } from '@/config/constants';

// Configuración optimizada del QueryClient
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache más agresivo para datos que no cambian frecuentemente
      staleTime: APP_CONFIG.QUERY_STALE_TIME,
      gcTime: APP_CONFIG.QUERY_GC_TIME,
      // Retry con backoff exponencial
      retry: (failureCount, error) => {
        if (failureCount < 2) return true;
        return false;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch en background para mejor UX
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
    },
    mutations: {
      // Retry para mutations críticas
      retry: 1,
      retryDelay: 1000,
    },
  },
});
