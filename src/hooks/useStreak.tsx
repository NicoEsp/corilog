import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { streakService, UserStreak, StreakReward } from '@/services/streakService';

export const useStreak = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showWeeklyReward, setShowWeeklyReward] = useState(false);

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
    if (!user) return;

    try {
      const updatedStreak = await streakService.updateUserStreak(user.id);
      
      if (updatedStreak) {
        // Check for rewards
        await streakService.checkAndAwardRewards(user.id, updatedStreak.current_streak);
        
        // Check if we just hit 7 days for the first time
        const previousStreak = userStreak?.current_streak || 0;
        if (updatedStreak.current_streak === 7 && previousStreak < 7) {
          setShowWeeklyReward(true);
        }

        // Invalidate and refetch data
        queryClient.invalidateQueries({ queryKey: ['userStreak', user.id] });
        queryClient.invalidateQueries({ queryKey: ['streakRewards', user.id] });
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  }, [user, userStreak?.current_streak, queryClient]);

  // Check for new rewards on data changes
  useEffect(() => {
    if (rewards && rewards.length > 0) {
      const weeklyReward = rewards.find(r => r.reward_type === 'weekly' && r.streak_days === 7);
      if (weeklyReward && !showWeeklyReward) {
        setShowWeeklyReward(true);
      }
    }
  }, [rewards, showWeeklyReward]);

  const currentStreak = userStreak?.current_streak || 0;
  const longestStreak = userStreak?.longest_streak || 0;
  const isLoading = isLoadingStreak || isLoadingRewards;

  return {
    // Streak data
    currentStreak,
    longestStreak,
    userStreak,
    
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