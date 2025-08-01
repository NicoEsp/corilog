import { useState, useEffect, useCallback } from 'react';
import { useStreakData } from './useStreakData';

export const useStreak = () => {
  const [showWeeklyReward, setShowWeeklyReward] = useState(false);
  const [lastSeenRewardId, setLastSeenRewardId] = useState<string | null>(null);

  // Use the optimized consolidated hook
  const streakData = useStreakData();

  // Check for new rewards on data changes
  useEffect(() => {
    if (streakData.rewards && streakData.rewards.length > 0) {
      const weeklyReward = streakData.rewards.find(r => r.reward_type === 'weekly' && r.streak_days === 7);
      if (weeklyReward && weeklyReward.id !== lastSeenRewardId && !showWeeklyReward) {
        setShowWeeklyReward(true);
        setLastSeenRewardId(weeklyReward.id);
      }
    }
  }, [streakData.rewards, showWeeklyReward, lastSeenRewardId]);

  // Removed smart expiration check - streaks now persist without risk alerts

  return {
    // Streak data
    currentStreak: streakData.currentStreak,
    longestStreak: streakData.longestStreak,
    userStreak: streakData.userStreak,
    
    // Rewards data
    rewards: streakData.rewards,
    weeklyReward: streakData.weeklyReward,
    
    // UI state
    showWeeklyReward,
    setShowWeeklyReward,
    
    // Loading states
    isLoading: streakData.isLoading,
    
    // Actions
    updateStreak: streakData.updateStreak,
    refetchStreak: streakData.refetch,
    refetchRewards: streakData.refetch,
  };
};