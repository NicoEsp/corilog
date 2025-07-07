
import { QueryClient } from '@tanstack/react-query';

// Configuración optimizada del QueryClient
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache más agresivo para datos que no cambian frecuentemente
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 30, // 30 minutos (antes cacheTime)
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
