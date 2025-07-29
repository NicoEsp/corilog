import { supabase } from "@/integrations/supabase/client";
import { format, startOfDay, differenceInDays, isToday, isYesterday } from "date-fns";

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
  reward_type: 'weekly' | 'monthly';
  streak_days: number;
  reward_data: any;
  claimed_at: string;
  created_at: string;
}

// Database return type
interface DbStreakReward {
  id: string;
  user_id: string;
  reward_type: string;
  streak_days: number;
  reward_data: any;
  claimed_at: string;
  created_at: string;
}

class StreakService {
  async getUserStreak(userId: string): Promise<UserStreak | null> {
    const { data, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user streak:', error);
      return null;
    }

    return data;
  }

  async calculateCurrentStreak(userId: string): Promise<number> {
    // Get all moments for the user, ordered by date descending
    const { data: moments, error } = await supabase
      .from('moments')
      .select('date')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error || !moments || moments.length === 0) {
      return 0;
    }

    // Group moments by date to handle multiple moments per day
    const uniqueDates = [...new Set(moments.map(m => m.date))].sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );

    if (uniqueDates.length === 0) return 0;

    const today = startOfDay(new Date());
    const yesterday = startOfDay(new Date(Date.now() - 24 * 60 * 60 * 1000));
    
    // Check if the most recent moment is today or yesterday
    const mostRecentDate = startOfDay(new Date(uniqueDates[0]));
    
    // If most recent moment is not today or yesterday, streak is 0
    if (!isToday(mostRecentDate) && !isYesterday(mostRecentDate)) {
      return 0;
    }

    // Count consecutive days
    let streak = 0;
    let currentCheckDate = today;

    for (const dateStr of uniqueDates) {
      const momentDate = startOfDay(new Date(dateStr));
      const daysDiff = differenceInDays(currentCheckDate, momentDate);

      if (daysDiff === 0) {
        // Moment is on the current check date
        streak++;
        currentCheckDate = new Date(currentCheckDate.getTime() - 24 * 60 * 60 * 1000);
      } else if (daysDiff === 1) {
        // Gap of one day, check if we started with today or can continue
        if (streak === 0 && isToday(mostRecentDate)) {
          // Started with today, continue counting from yesterday
          currentCheckDate = new Date(currentCheckDate.getTime() - 24 * 60 * 60 * 1000);
          continue;
        } else {
          // Normal gap of one day, continue
          streak++;
          currentCheckDate = momentDate;
          currentCheckDate = new Date(currentCheckDate.getTime() - 24 * 60 * 60 * 1000);
        }
      } else {
        // Gap too large, streak ends
        break;
      }
    }

    return streak;
  }

  async updateUserStreak(userId: string): Promise<UserStreak | null> {
    const currentStreak = await this.calculateCurrentStreak(userId);
    const today = format(new Date(), 'yyyy-MM-dd');

    // Get existing streak record
    let existingStreak = await this.getUserStreak(userId);

    const streakData = {
      user_id: userId,
      current_streak: currentStreak,
      longest_streak: Math.max(currentStreak, existingStreak?.longest_streak || 0),
      last_activity_date: currentStreak > 0 ? today : existingStreak?.last_activity_date,
      streak_start_date: currentStreak > 0 ? 
        (existingStreak?.current_streak === 0 ? today : existingStreak?.streak_start_date) : 
        null,
    };

    if (existingStreak) {
      const { data, error } = await supabase
        .from('user_streaks')
        .update(streakData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user streak:', error);
        return null;
      }

      return data;
    } else {
      const { data, error } = await supabase
        .from('user_streaks')
        .insert(streakData)
        .select()
        .single();

      if (error) {
        console.error('Error creating user streak:', error);
        return null;
      }

      return data;
    }
  }

  async checkAndAwardRewards(userId: string, currentStreak: number): Promise<void> {
    // Check for 7-day reward
    if (currentStreak === 7) {
      await this.awardWeeklyReward(userId);
    }

    // Check for 30-day reward (backend only for now)
    if (currentStreak === 30) {
      await this.awardMonthlyReward(userId);
    }
  }

  async awardWeeklyReward(userId: string): Promise<StreakReward | null> {
    // Check if already awarded
    const { data: existing } = await supabase
      .from('streak_rewards')
      .select('*')
      .eq('user_id', userId)
      .eq('reward_type', 'weekly')
      .eq('streak_days', 7)
      .maybeSingle();

    if (existing) return existing as StreakReward;

    const rewardData = {
      user_id: userId,
      reward_type: 'weekly' as const,
      streak_days: 7,
      reward_data: {
        type: 'image',
        message: '¡7 días de racha consecutiva!',
        generated: false
      }
    };

    const { data, error } = await supabase
      .from('streak_rewards')
      .insert(rewardData)
      .select()
      .single();

    if (error) {
      console.error('Error awarding weekly reward:', error);
      return null;
    }

    return data as StreakReward;
  }

  async awardMonthlyReward(userId: string): Promise<StreakReward | null> {
    // Check if already awarded
    const { data: existing } = await supabase
      .from('streak_rewards')
      .select('*')
      .eq('user_id', userId)
      .eq('reward_type', 'monthly')
      .eq('streak_days', 30)
      .maybeSingle();

    if (existing) return existing as StreakReward;

    const rewardData = {
      user_id: userId,
      reward_type: 'monthly' as const,
      streak_days: 30,
      reward_data: {
        type: 'reward_code',
        message: '¡30 días de racha consecutiva!',
        reward_description: 'Suscripción Premium',
        code_generated: false
      }
    };

    const { data, error } = await supabase
      .from('streak_rewards')
      .insert(rewardData)
      .select()
      .single();

    if (error) {
      console.error('Error awarding monthly reward:', error);
      return null;
    }

    return data as StreakReward;
  }

  async getUnclaimedRewards(userId: string): Promise<StreakReward[]> {
    const { data, error } = await supabase
      .from('streak_rewards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching rewards:', error);
      return [];
    }

    return (data || []) as StreakReward[];
  }
}

export const streakService = new StreakService();