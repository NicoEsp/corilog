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

  // Smart expiration check on window focus
  useEffect(() => {
    const handleFocus = () => {
      streakData.checkStreakExpiration();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        handleFocus();
      }
    });
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [streakData.checkStreakExpiration]);

  return {
    // Streak data
    currentStreak: streakData.currentStreak,
    longestStreak: streakData.longestStreak,
    userStreak: streakData.userStreak,
    isStreakAtRisk: streakData.isStreakAtRisk,
    
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