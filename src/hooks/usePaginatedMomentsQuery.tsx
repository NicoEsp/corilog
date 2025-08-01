import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useCallback, useMemo, useState } from 'react';
import { sanitizeTitle, sanitizeNote } from '@/utils/inputSanitization';
import { APP_CONFIG } from '@/config/constants';
import { isToday } from 'date-fns';
import type { Moment, CreateMomentData } from '@/types/moment';

interface PaginatedMomentsResult {
  data: Moment[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

interface UsePaginatedMomentsQueryReturn {
  moments: Moment[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  goToPage: (page: number) => void;
  createMoment: (momentData: CreateMomentData) => void;
  deleteMoment: (momentId: string) => void;
  toggleFeatured: (momentId: string, isFeatured: boolean) => void;
  isCreating: boolean;
  isDeleting: boolean;
  isTogglingFeatured: boolean;
}

export function usePaginatedMomentsQuery(initialPage = 1): UsePaginatedMomentsQueryReturn {
  const { user, session } = useAuth();
  const queryClient = useQueryClient();
  
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  // Fetch paginated moments
  const { 
    data: paginatedResult, 
    isLoading, 
    error, 
    refetch 
  } = useQuery<PaginatedMomentsResult>({
    queryKey: ['moments', 'paginated', user?.id, currentPage],
    queryFn: async () => {
      if (!user?.id) return { data: [], totalCount: 0, totalPages: 0, currentPage: 1 };
      
      const offset = (currentPage - 1) * APP_CONFIG.MOMENTS_PER_PAGE;
      
      // Get total count
      const { count } = await supabase
        .from('moments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      // Get paginated data
      const { data, error } = await supabase
        .from('moments')
        .select('*')
        .eq('user_id', user.id)
        .order('is_featured', { ascending: false })
        .order('date', { ascending: false })
        .range(offset, offset + APP_CONFIG.MOMENTS_PER_PAGE - 1);
      
      if (error) throw error;
      
      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / APP_CONFIG.MOMENTS_PER_PAGE);
      
      const moments: Moment[] = (data || []).map(moment => ({
        ...moment,
        date: new Date(moment.date),
        created_at: new Date(moment.created_at),
        updated_at: new Date(moment.updated_at)
      }));
      
      return {
        data: moments,
        totalCount,
        totalPages,
        currentPage
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 3, // 3 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.status === 403) return false;
      return failureCount < 2;
    },
  });

  // Create moment mutation
  const createMutation = useMutation({
    mutationFn: async (momentData: CreateMomentData) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const sanitizedData = {
        title: sanitizeTitle(momentData.title),
        note: momentData.note ? sanitizeNote(momentData.note) : '',
        photo: momentData.photo || null,
        date: (momentData.date || new Date()).toISOString(),
        is_featured: false,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('moments')
        .insert([sanitizedData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newMoment) => {
      // Optimistic update instead of invalidation
      queryClient.setQueryData(['moments', 'paginated', user?.id, currentPage], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: [newMoment, ...oldData.data.slice(0, APP_CONFIG.MOMENTS_PER_PAGE - 1)],
          totalCount: oldData.totalCount + 1
        };
      });
      
      // Only invalidate streak data
      queryClient.invalidateQueries({ queryKey: ['streakData', user?.id] });
      
      toast({
        title: "Momento guardado",
        description: "Tu momento ha sido guardado exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Error al guardar el momento",
        variant: "destructive",
      });
    },
  });

  // Delete moment mutation
  const deleteMutation = useMutation({
    mutationFn: async (momentId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('moments')
        .delete()
        .eq('id', momentId)
        .eq('user_id', user.id);

      if (error) throw error;
      return momentId;
    },
    onSuccess: () => {
      // Optimistic update
      queryClient.setQueryData(['moments', 'paginated', user?.id, currentPage], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data.filter((m: any) => m.id !== deleteMutation.variables),
          totalCount: oldData.totalCount - 1
        };
      });
      
      toast({
        title: "Momento eliminado",
        description: "El momento ha sido eliminado exitosamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Error al eliminar el momento",
        variant: "destructive",
      });
    },
  });

  // Toggle featured mutation
  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ momentId, isFeatured }: { momentId: string; isFeatured: boolean }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('moments')
        .update({ is_featured: isFeatured })
        .eq('id', momentId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moments', 'paginated', user?.id] });
      
      toast({
        title: "Momento actualizado",
        description: "El estado destacado ha sido actualizado",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Error al actualizar el momento",
        variant: "destructive",
      });
    },
  });

  // Memoized values
  const moments = useMemo(() => paginatedResult?.data || [], [paginatedResult?.data]);
  const totalPages = useMemo(() => paginatedResult?.totalPages || 0, [paginatedResult?.totalPages]);
  const totalCount = useMemo(() => paginatedResult?.totalCount || 0, [paginatedResult?.totalCount]);

  // Page navigation
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  // Mutation functions
  const createMoment = useCallback((momentData: CreateMomentData) => {
    createMutation.mutate(momentData);
  }, [createMutation]);

  const deleteMoment = useCallback((momentId: string) => {
    deleteMutation.mutate(momentId);
  }, [deleteMutation]);

  const toggleFeatured = useCallback((momentId: string, isFeatured: boolean) => {
    toggleFeaturedMutation.mutate({ momentId, isFeatured });
  }, [toggleFeaturedMutation]);

  return {
    moments,
    totalPages,
    currentPage,
    totalCount,
    isLoading,
    error: error as Error | null,
    refetch,
    goToPage,
    createMoment,
    deleteMoment,
    toggleFeatured,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isTogglingFeatured: toggleFeaturedMutation.isPending,
  };
}