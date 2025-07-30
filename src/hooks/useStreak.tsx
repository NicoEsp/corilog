import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { streakService, UserStreak, StreakReward } from '@/services/streakService';
import { useToast } from '@/hooks/use-toast';

export const useStreak = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showWeeklyReward, setShowWeeklyReward] = useState(false);
  const [lastSeenRewardId, setLastSeenRewardId] = useState<string | null>(null);

  // Query for user streak
  const {
    data: userStreak,
    isLoading: isLoadingStreak,
    refetch: refetchStreak
  } = useQuery({
    queryKey: ['userStreak', user?.id],
    queryFn: () => user ? streakService.getUserStreak(user.id) : null,
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Query for rewards
  const {
    data: rewards,
    isLoading: isLoadingRewards,
    refetch: refetchRewards
  } = useQuery({
    queryKey: ['streakRewards', user?.id],
    queryFn: () => user ? streakService.getUnclaimedRewards(user.id) : [],
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Update streak when user creates a moment
  const updateStreak = useCallback(async () => {
    if (!user) return null;

    try {
      const previousStreak = userStreak?.current_streak || 0;
      const updatedStreak = await streakService.updateUserStreak(user.id);
      
      if (updatedStreak) {
        // Check for rewards
        await streakService.checkAndAwardRewards(user.id, updatedStreak.current_streak);
        
        // Show toast for streak progress
        if (updatedStreak.current_streak > previousStreak) {
          toast({
            title: "¡Racha actualizada!",
            description: `${updatedStreak.current_streak} ${updatedStreak.current_streak === 1 ? 'día' : 'días'} consecutivos`,
            duration: 3000,
          });
        }

        // Invalidate and refetch data
        queryClient.invalidateQueries({ queryKey: ['userStreak', user.id] });
        queryClient.invalidateQueries({ queryKey: ['streakRewards', user.id] });
        
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
  }, [user, userStreak?.current_streak, queryClient, toast]);

  // Check for new rewards on data changes
  useEffect(() => {
    if (rewards && rewards.length > 0) {
      const weeklyReward = rewards.find(r => r.reward_type === 'weekly' && r.streak_days === 7);
      if (weeklyReward && weeklyReward.id !== lastSeenRewardId && !showWeeklyReward) {
        setShowWeeklyReward(true);
        setLastSeenRewardId(weeklyReward.id);
      }
    }
  }, [rewards, showWeeklyReward, lastSeenRewardId]);

  // Check for streak expiration periodically
  useEffect(() => {
    if (!user) return;

    const checkExpiration = async () => {
      try {
        const wasExpired = await streakService.checkStreakExpiration(user.id);
        if (wasExpired) {
          toast({
            title: "Racha perdida",
            description: "Tu racha se ha reiniciado. ¡Empieza una nueva desde hoy!",
            variant: "default",
          });
          queryClient.invalidateQueries({ queryKey: ['userStreak', user.id] });
        }
      } catch (error) {
        console.error('Error checking streak expiration:', error);
      }
    };

    // Check on mount and every hour
    checkExpiration();
    const interval = setInterval(checkExpiration, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user, queryClient, toast]);

  // Check if streak is at risk
  const isStreakAtRisk = userStreak?.last_activity_date ? 
    streakService.isStreakAtRisk(userStreak.last_activity_date) : false;

  const currentStreak = userStreak?.current_streak || 0;
  const longestStreak = userStreak?.longest_streak || 0;
  const isLoading = isLoadingStreak || isLoadingRewards;

  return {
    // Streak data
    currentStreak,
    longestStreak,
    userStreak,
    isStreakAtRisk,
    
    // Rewards data
    rewards: rewards || [],
    weeklyReward: rewards?.find(r => r.reward_type === 'weekly' && r.streak_days === 7),
    
    // UI state
    showWeeklyReward,
    setShowWeeklyReward,
    
    // Loading states
    isLoading,
    
    // Actions
    updateStreak,
    refetchStreak,
    refetchRewards,
  };
};