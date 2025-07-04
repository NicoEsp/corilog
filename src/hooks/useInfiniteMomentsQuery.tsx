
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { MomentService } from '@/services/momentService';
import { MigrationService } from '@/services/migrationService';
import { Moment, CreateMomentData } from '@/types/moment';

const MOMENTS_QUERY_KEY = 'moments';
const PAGE_SIZE = 10;

export const useInfiniteMomentsQuery = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Infinite query para momentos con paginación
  const momentsQuery = useInfiniteQuery({
    queryKey: [MOMENTS_QUERY_KEY, user?.id],
    queryFn: async ({ pageParam = 0 }) => {
      if (!user) return { moments: [], hasMore: false };
      
      // Migrar momentos del localStorage solo en la primera carga
      if (pageParam === 0) {
        await MigrationService.migrateMomentsFromLocalStorage(user.id);
      }
      
      const moments = await MomentService.fetchMoments(user.id, PAGE_SIZE, pageParam);
      
      return {
        moments,
        hasMore: moments.length === PAGE_SIZE,
        nextOffset: pageParam + PAGE_SIZE,
      };
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextOffset : undefined;
    },
    initialPageParam: 0,
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 30, // 30 minutos
  });

  // Mutation para crear momento con optimistic update
  const createMomentMutation = useMutation({
    mutationFn: async (momentData: CreateMomentData) => {
      if (!user) throw new Error('Usuario no autenticado');
      return MomentService.createMoment(user.id, momentData);
    },
    onMutate: async (newMoment) => {
      await queryClient.cancelQueries({ queryKey: [MOMENTS_QUERY_KEY] });

      const previousData = queryClient.getQueryData([MOMENTS_QUERY_KEY, user?.id]);

      const tempMoment: Moment = {
        id: `temp-${Date.now()}`,
        ...newMoment,
        user_id: user!.id,
        is_featured: false,
      };

      // Optimistic update - agregar al inicio de la primera página
      queryClient.setQueryData([MOMENTS_QUERY_KEY, user?.id], (old: any) => {
        if (!old?.pages) return old;
        
        const newPages = [...old.pages];
        newPages[0] = {
          ...newPages[0],
          moments: [tempMoment, ...newPages[0].moments],
        };
        
        return { ...old, pages: newPages };
      });

      return { previousData };
    },
    onError: (err, newMoment, context) => {
      if (context?.previousData) {
        queryClient.setQueryData([MOMENTS_QUERY_KEY, user?.id], context.previousData);
      }
    },
    onSuccess: (newMoment) => {
      if (newMoment) {
        // Actualizar con el momento real del servidor
        queryClient.setQueryData([MOMENTS_QUERY_KEY, user?.id], (old: any) => {
          if (!old?.pages) return old;
          
          const newPages = [...old.pages];
          newPages[0] = {
            ...newPages[0],
            moments: [newMoment, ...newPages[0].moments.filter((m: Moment) => !m.id.startsWith('temp-'))],
          };
          
          return { ...old, pages: newPages };
        });
      }
    },
  });

  // Mutation para eliminar momento
  const deleteMomentMutation = useMutation({
    mutationFn: async (momentId: string) => {
      if (!user) throw new Error('Usuario no autenticado');
      const success = await MomentService.deleteMoment(user.id, momentId);
      if (!success) throw new Error('Error al eliminar momento');
      return momentId;
    },
    onMutate: async (momentId) => {
      await queryClient.cancelQueries({ queryKey: [MOMENTS_QUERY_KEY] });
      
      const previousData = queryClient.getQueryData([MOMENTS_QUERY_KEY, user?.id]);
      
      // Optimistic update - remover momento de todas las páginas
      queryClient.setQueryData([MOMENTS_QUERY_KEY, user?.id], (old: any) => {
        if (!old?.pages) return old;
        
        const newPages = old.pages.map((page: any) => ({
          ...page,
          moments: page.moments.filter((moment: Moment) => moment.id !== momentId),
        }));
        
        return { ...old, pages: newPages };
      });

      return { previousData };
    },
    onError: (err, momentId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData([MOMENTS_QUERY_KEY, user?.id], context.previousData);
      }
    },
  });

  // Mutation para destacar/no destacar momento
  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ momentId, isFeatured }: { momentId: string; isFeatured: boolean }) => {
      if (!user) throw new Error('Usuario no autenticado');
      const success = await MomentService.toggleFeaturedMoment(user.id, momentId, isFeatured);
      if (!success) throw new Error('Error al cambiar estado destacado');
      return { momentId, isFeatured };
    },
    onMutate: async ({ momentId, isFeatured }) => {
      await queryClient.cancelQueries({ queryKey: [MOMENTS_QUERY_KEY] });
      
      const previousData = queryClient.getQueryData([MOMENTS_QUERY_KEY, user?.id]);
      
      // Optimistic update - cambiar estado destacado
      queryClient.setQueryData([MOMENTS_QUERY_KEY, user?.id], (old: any) => {
        if (!old?.pages) return old;
        
        const newPages = old.pages.map((page: any) => ({
          ...page,
          moments: page.moments.map((moment: Moment) => 
            moment.id === momentId 
              ? { ...moment, is_featured: isFeatured }
              : moment
          ),
        }));
        
        return { ...old, pages: newPages };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData([MOMENTS_QUERY_KEY, user?.id], context.previousData);
      }
    },
    onSuccess: () => {
      // Refetch para reordenar (destacados primero)
      queryClient.invalidateQueries({ queryKey: [MOMENTS_QUERY_KEY, user?.id] });
    },
  });

  // Aplanar todos los momentos de todas las páginas
  const allMoments = momentsQuery.data?.pages.flatMap(page => page.moments) || [];

  return {
    moments: allMoments,
    isLoading: momentsQuery.isLoading,
    isLoadingMore: momentsQuery.isFetchingNextPage,
    hasNextPage: momentsQuery.hasNextPage,
    fetchNextPage: momentsQuery.fetchNextPage,
    error: momentsQuery.error,
    refetch: momentsQuery.refetch,
    createMoment: createMomentMutation.mutate,
    deleteMoment: deleteMomentMutation.mutate,
    toggleFeatured: toggleFeaturedMutation.mutate,
    isCreating: createMomentMutation.isPending,
    isDeleting: deleteMomentMutation.isPending,
    isTogglingFeatured: toggleFeaturedMutation.isPending,
  };
};
