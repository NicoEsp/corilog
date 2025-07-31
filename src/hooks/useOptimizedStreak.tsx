import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useStreakData } from './useStreakData';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Hook optimizado que wrappea useStreakData con mejor UX
export const useOptimizedStreak = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const streakData = useStreakData();

  // Función para actualizar streak con feedback inmediato
  const updateStreakWithFeedback = useCallback(async () => {
    if (!user) return null;

    const currentStreak = streakData.currentStreak || 0;
    const newStreak = currentStreak + 1;

    // Optimistic update del contador visual
    queryClient.setQueryData(['streakData', user.id], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        userStreak: {
          ...old.userStreak,
          current_streak: newStreak,
          last_activity_date: new Date().toISOString().split('T')[0]
        }
      };
    });

    // Toast inmediato
    toast({
      title: "¡Momento agregado!",
      description: `Racha: ${newStreak} ${newStreak === 1 ? 'día' : 'días'} consecutivos`,
      duration: 2000,
    });

    // Luego actualizar en el servidor
    try {
      const result = await streakData.updateStreak();
      if (result) {
        console.log('✅ Streak actualizado en servidor:', result.current_streak);
      }
    } catch (error) {
      console.error('❌ Error actualizando streak:', error);
      // Revertir optimistic update en caso de error
      queryClient.invalidateQueries({ queryKey: ['streakData', user.id] });
    }

    return newStreak;
  }, [user, streakData, toast, queryClient]);

  return {
    ...streakData,
    updateStreakWithFeedback,
  };
};