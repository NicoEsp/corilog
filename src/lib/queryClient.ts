
import { QueryClient } from '@tanstack/react-query';
import { APP_CONFIG } from '@/config/constants';

// Configuración optimizada del QueryClient para móvil
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache optimizado para móvil (más agresivo)
      staleTime: APP_CONFIG.QUERY_STALE_TIME,
      gcTime: APP_CONFIG.QUERY_GC_TIME,
      // Retry inteligente con detección de red
      retry: (failureCount, error: any) => {
        // No retry en errores de autenticación
        if (error?.status === 401 || error?.status === 403) return false;
        // Menos retries en móvil para ahorrar batería
        const isMobile = window.innerWidth < 768;
        const maxRetries = isMobile ? 1 : 2;
        return failureCount < maxRetries;
      },
      retryDelay: (attemptIndex) => {
        // Delay más corto en móvil
        const baseDelay = window.innerWidth < 768 ? 500 : 1000;
        return Math.min(baseDelay * 2 ** attemptIndex, 15000);
      },
      // Background refetch optimizado
      refetchOnWindowFocus: false, // Evitar refetch innecesario
      refetchOnReconnect: 'always', // Importante para móvil
      // Network mode para mejor handling offline
      networkMode: 'offlineFirst',
    },
    mutations: {
      // Retry optimizado para mutations
      retry: (failureCount, error: any) => {
        if (error?.status === 401 || error?.status === 403) return false;
        return failureCount < 1; // Solo 1 retry para mutations
      },
      retryDelay: 1000,
      // Network mode para mutations
      networkMode: 'online',
    },
  },
});
