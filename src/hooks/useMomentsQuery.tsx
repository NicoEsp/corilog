
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { MomentService } from '@/services/momentService';
import { MigrationService } from '@/services/migrationService';
import { Moment, CreateMomentData } from '@/types/moment';

const MOMENTS_QUERY_KEY = 'moments';

export const useMomentsQuery = (limit: number = 20, offset: number = 0) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query para obtener momentos con cache automático
  const momentsQuery = useQuery({
    queryKey: [MOMENTS_QUERY_KEY, user?.id, limit, offset],
    queryFn: async () => {
      if (!user) return [];
      
      // Migrar momentos del localStorage solo en la primera carga
      if (offset === 0) {
        await MigrationService.migrateMomentsFromLocalStorage(user.id);
      }
      
      return MomentService.fetchMoments(user.id, limit, offset);
    },
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
      // Cancelar queries en curso
      await queryClient.cancelQueries({ queryKey: [MOMENTS_QUERY_KEY] });

      // Snapshot del estado anterior
      const previousMoments = queryClient.getQueryData([MOMENTS_QUERY_KEY, user?.id, limit, offset]);

      // Optimistic update
      const tempMoment: Moment = {
        id: `temp-${Date.now()}`,
        ...newMoment,
        user_id: user!.id,
      };

      queryClient.setQueryData([MOMENTS_QUERY_KEY, user?.id, limit, offset], (old: Moment[] = []) => 
        [tempMoment, ...old]
      );

      return { previousMoments };
    },
    onError: (err, newMoment, context) => {
      // Revertir en caso de error
      if (context?.previousMoments) {
        queryClient.setQueryData([MOMENTS_QUERY_KEY, user?.id, limit, offset], context.previousMoments);
      }
    },
    onSuccess: (newMoment) => {
      if (newMoment) {
        // Actualizar con el momento real del servidor
        queryClient.setQueryData([MOMENTS_QUERY_KEY, user?.id, limit, offset], (old: Moment[] = []) => 
          [newMoment, ...old.filter(m => !m.id.startsWith('temp-'))]
        );
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
      
      const previousMoments = queryClient.getQueryData([MOMENTS_QUERY_KEY, user?.id, limit, offset]);
      
      // Optimistic update - remover momento
      queryClient.setQueryData([MOMENTS_QUERY_KEY, user?.id, limit, offset], (old: Moment[] = []) => 
        old.filter(moment => moment.id !== momentId)
      );

      return { previousMoments };
    },
    onError: (err, momentId, context) => {
      if (context?.previousMoments) {
        queryClient.setQueryData([MOMENTS_QUERY_KEY, user?.id, limit, offset], context.previousMoments);
      }
    },
  });

  return {
    moments: momentsQuery.data || [],
    isLoading: momentsQuery.isLoading,
    error: momentsQuery.error,
    refetch: momentsQuery.refetch,
    createMoment: createMomentMutation.mutate,
    deleteMoment: deleteMomentMutation.mutate,
    isCreating: createMomentMutation.isPending,
    isDeleting: deleteMomentMutation.isPending,
  };
};
