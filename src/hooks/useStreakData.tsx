import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMemo, useCallback } from 'react';

export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  streak_start_date: string | null;
  last_reward_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface StreakReward {
  id: string;
  user_id: string;
  streak_days: number;
  reward_type: string;
  reward_data: any;
  claimed_at: string;
  created_at: string;
}

interface StreakData {
  userStreak: UserStreak | null;
  rewards: StreakReward[];
}

export const useStreakData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Combined query for streak and rewards
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['streakData', user?.id],
    queryFn: async (): Promise<StreakData> => {
      if (!user) {
        return { userStreak: null, rewards: [] };
      }

      // Fetch user streak using optimized backend function
      const { data: streakData, error: streakError } = await supabase.rpc(
        'update_user_streak_optimized',
        { p_user_id: user.id }
      );

      if (streakError) {
        console.error('Error fetching streak:', streakError);
        throw streakError;
      }

      // Fetch unclaimed rewards
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('streak_rewards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (rewardsError) {
        console.error('Error fetching rewards:', rewardsError);
        // Don't throw for rewards error, just log it
      }

      return {
        userStreak: streakData?.[0] || null,
        rewards: rewardsData || []
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2, // 2 minutes - reduced from 5
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  // Update streak when user creates a moment (optimized version)
  const updateStreak = useCallback(async () => {
    if (!user) return null;

    try {
      const previousStreak = data?.userStreak?.current_streak || 0;
      
      // Call optimized backend function
      const { data: updatedStreakData, error } = await supabase.rpc(
        'update_user_streak_optimized',
        { p_user_id: user.id }
      );

      if (error) {
        throw error;
      }

      const updatedStreak = updatedStreakData?.[0];
      if (updatedStreak) {
        // Check for rewards only if streak increased
        if (updatedStreak.current_streak > previousStreak) {
          // Call streak service to check and award rewards
          if (updatedStreak.current_streak >= 7 && updatedStreak.current_streak % 7 === 0) {
            // Award weekly reward
            const { error: rewardError } = await supabase
              .from('streak_rewards')
              .insert({
                user_id: user.id,
                streak_days: 7,
                reward_type: 'weekly',
                reward_data: { type: 'weekly_achievement', streak: updatedStreak.current_streak }
              });
            
            if (rewardError && !rewardError.message.includes('duplicate key')) {
              console.error('Error awarding weekly reward:', rewardError);
            }
          }

          // Show toast for streak progress
          toast({
            title: "¡Racha actualizada!",
            description: `${updatedStreak.current_streak} ${updatedStreak.current_streak === 1 ? 'día' : 'días'} consecutivos`,
            duration: 3000,
          });
        }

        // Invalidate and refetch data efficiently
        queryClient.setQueryData(['streakData', user.id], {
          userStreak: updatedStreak,
          rewards: data?.rewards || []
        });
        
        // Also refetch to get latest rewards
        refetch();
        
        return updatedStreak;
      }
    } catch (error) {
      console.error('Error updating streak:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la racha. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
    return null;
  }, [user, data?.userStreak?.current_streak, data?.rewards, queryClient, toast, refetch]);

  // Smart expiration check (only on focus/interaction)
  const checkStreakExpiration = useCallback(async () => {
    if (!user || !data?.userStreak?.last_activity_date) return false;

    const lastActivity = new Date(data.userStreak.last_activity_date);
    const now = new Date();
    const daysSinceActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

    // If more than 1 day since last activity, streak might be expired
    if (daysSinceActivity > 1) {
      const { data: updatedStreakData } = await supabase.rpc(
        'update_user_streak_optimized',
        { p_user_id: user.id }
      );

      const updatedStreak = updatedStreakData?.[0];
      if (updatedStreak && updatedStreak.current_streak === 0 && data.userStreak.current_streak > 0) {
        toast({
          title: "Racha perdida",
          description: "Tu racha se ha reiniciado. ¡Empieza una nueva desde hoy!",
          variant: "default",
        });

        // Update cache
        queryClient.setQueryData(['streakData', user.id], {
          userStreak: updatedStreak,
          rewards: data?.rewards || []
        });

        return true;
      }
    }

    return false;
  }, [user, data, queryClient, toast]);

  // Derived values with memoization
  const derivedData = useMemo(() => {
    const userStreak = data?.userStreak;
    const rewards = data?.rewards || [];
    
    // Check if streak is at risk (more than 20 hours since last activity)
    const isStreakAtRisk = userStreak?.last_activity_date ? (() => {
      const lastActivity = new Date(userStreak.last_activity_date);
      const now = new Date();
      const hoursSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
      return hoursSinceActivity > 20;
    })() : false;

    const weeklyReward = rewards.find(r => r.reward_type === 'weekly' && r.streak_days === 7);
    const currentStreak = userStreak?.current_streak || 0;
    const longestStreak = userStreak?.longest_streak || 0;

    return {
      currentStreak,
      longestStreak,
      userStreak,
      isStreakAtRisk,
      rewards,
      weeklyReward,
    };
  }, [data]);

  return {
    ...derivedData,
    isLoading,
    error,
    updateStreak,
    checkStreakExpiration,
    refetch,
  };
};