import { useMemo, useCallback } from 'react';
import { useInfiniteMomentsQuery } from './useInfiniteMomentsQuery';
import { Moment } from '@/types/moment';
import { logger } from '@/utils/logger';

// Hook optimizado que combina y mejora la funcionalidad de moments
export const useOptimizedMoments = () => {
  const {
    moments: rawMoments,
    isLoading,
    isLoadingMore,
    hasNextPage,
    fetchNextPage,
    createMoment,
    deleteMoment,
    toggleFeatured,
    isCreating,
    isDeleting,
    isTogglingFeatured,
  } = useInfiniteMomentsQuery();

  // Los momentos ya vienen procesados del hook original
  const moments = useMemo(() => rawMoments || [], [rawMoments]);

  // Memoizar estadísticas de momentos
  const stats = useMemo(() => {
    const total = moments.length;
    const featured = moments.filter(m => m.is_featured).length;
    const thisMonth = moments.filter(m => {
      const now = new Date();
      const momentDate = new Date(m.date);
      return momentDate.getMonth() === now.getMonth() && 
             momentDate.getFullYear() === now.getFullYear();
    }).length;

    return { total, featured, thisMonth };
  }, [moments]);

  // Callbacks optimizados que wrappean las funciones existentes
  const optimizedCreateMoment = useCallback(async (momentData: any) => {
    try {
      logger.info('Creando nuevo momento', 'useOptimizedMoments');
      await createMoment(momentData);
    } catch (error) {
      logger.error('Error creando momento', 'useOptimizedMoments', error);
      throw error;
    }
  }, [createMoment]);

  const optimizedDeleteMoment = useCallback(async (momentId: string) => {
    try {
      logger.info('Eliminando momento', 'useOptimizedMoments', { momentId });
      await deleteMoment(momentId);
    } catch (error) {
      logger.error('Error eliminando momento', 'useOptimizedMoments', error);
      throw error;
    }
  }, [deleteMoment]);

  const optimizedToggleFeatured = useCallback(async (momentId: string, isFeatured: boolean) => {
    try {
      logger.info('Cambiando estado destacado', 'useOptimizedMoments', { momentId, isFeatured });
      await toggleFeatured({ momentId, isFeatured });
    } catch (error) {
      logger.error('Error cambiando estado destacado', 'useOptimizedMoments', error);
      throw error;
    }
  }, [toggleFeatured]);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isLoadingMore) {
      logger.debug('Cargando más momentos', 'useOptimizedMoments');
      fetchNextPage();
    }
  }, [hasNextPage, isLoadingMore, fetchNextPage]);

  // Funciones de utilidad para filtrado
  const getFeaturedMoments = useCallback(() => {
    return moments.filter(m => m.is_featured);
  }, [moments]);

  const getMomentsByYear = useCallback((year: number) => {
    return moments.filter(m => new Date(m.date).getFullYear() === year);
  }, [moments]);

  const getMomentsByMonth = useCallback((year: number, month: number) => {
    return moments.filter(m => {
      const date = new Date(m.date);
      return date.getFullYear() === year && date.getMonth() === month;
    });
  }, [moments]);

  return {
    // Datos
    moments,
    stats,
    
    // Estados de carga
    isLoading,
    error: null,
    hasNextPage,
    isLoadingMore,
    
    // Acciones
    createMoment: optimizedCreateMoment,
    deleteMoment: optimizedDeleteMoment,
    toggleFeatured: optimizedToggleFeatured,
    loadMore,
    
    // Utilidades
    getFeaturedMoments,
    getMomentsByYear,
    getMomentsByMonth,
    
    // Estados de mutaciones
    isCreating,
    isDeleting,
    isUpdating: isTogglingFeatured,
  };
};