
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { MomentService } from '@/services/momentService';
import { MigrationService } from '@/services/migrationService';
import { Moment, CreateMomentData } from '@/types/moment';
import { toast } from '@/hooks/use-toast';

const MOMENTS_QUERY_KEY = 'moments';
const PAGE_SIZE = 10;

// Flag para evitar migración múltiple
let migrationCompleted = false;

export const useInfiniteMomentsQuery = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Infinite query para momentos con paginación optimizada
  const momentsQuery = useInfiniteQuery({
    queryKey: [MOMENTS_QUERY_KEY, user?.id],
    queryFn: async ({ pageParam = 0 }) => {
      if (!user) return { moments: [], hasMore: false };
      
      // Solo migrar en development, nunca en production
      if (pageParam === 0 && !migrationCompleted && import.meta.env.DEV) {
        console.log('Ejecutando migración única de localStorage (DEV only)');
        await MigrationService.migrateMomentsFromLocalStorage(user.id);
        migrationCompleted = true;
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
    staleTime: 1000 * 60 * 2, // 2 minutos (más frecuente para momentos recientes)
    gcTime: 1000 * 60 * 15, // 15 minutos (optimizado)
  });

  // Mutation para crear momento con feedback inmediato
  const createMomentMutation = useMutation({
    mutationFn: async (momentData: CreateMomentData) => {
      if (!user) throw new Error('Usuario no autenticado');
      return MomentService.createMoment(user.id, momentData);
    },
    onMutate: async (newMoment) => {
      console.log('🚀 Iniciando creación de momento - Feedback inmediato');
      
      // Cancelar queries en curso
      await queryClient.cancelQueries({ queryKey: [MOMENTS_QUERY_KEY] });

      // Snapshot del estado anterior
      const previousData = queryClient.getQueryData([MOMENTS_QUERY_KEY, user?.id]);

      // Crear momento temporal para optimistic update
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

      // 🎉 Toast de éxito inmediato con optimistic update
      toast({
        title: "¡Momento guardado!",
        description: "Tu momento se está sincronizando...",
      });

      return { previousData };
    },
    onError: (err, newMoment, context) => {
      console.error('❌ Error al crear momento:', err);
      
      // Revertir optimistic update
      if (context?.previousData) {
        queryClient.setQueryData([MOMENTS_QUERY_KEY, user?.id], context.previousData);
      }
      
      // Toast de error
      toast({
        title: "Error al guardar",
        description: "Hubo un problema al guardar tu momento. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
    onSuccess: (newMoment) => {
      console.log('✅ Momento creado exitosamente en el servidor');
      
      if (newMoment) {
        // Actualizar con el momento real del servidor
        queryClient.setQueryData([MOMENTS_QUERY_KEY, user?.id], (old: any) => {
          if (!old?.pages) return old;
          
          const newPages = [...old.pages];
          newPages[0] = {
            ...newPages[0],
            moments: [
              newMoment, 
              ...newPages[0].moments.filter((m: Moment) => !m.id.startsWith('temp-'))
            ],
          };
          
          return { ...old, pages: newPages };
        });

        // Solo actualizar streak si el momento es de hoy
        const isToday = new Date(newMoment.date).toDateString() === new Date().toDateString();
        if (user?.id && isToday) {
          console.log('📈 Momento de hoy creado - Actualizando streak');
          queryClient.invalidateQueries({ queryKey: ['streakData', user.id] });
        }

        // Toast de confirmación final (opcional, más sutil)
        toast({
          title: "Sincronizado",
          description: "Tu momento se ha guardado correctamente",
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
