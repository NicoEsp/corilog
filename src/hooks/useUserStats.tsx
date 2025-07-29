import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/utils/logger';

export interface UserStats {
  totalMoments: number;
  lastMomentDate: Date | null;
  memberSince: Date | null;
}

export const useUserStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['userStats', user?.id],
    queryFn: async (): Promise<UserStats> => {
      if (!user) {
        return {
          totalMoments: 0,
          lastMomentDate: null,
          memberSince: null
        };
      }

      try {
        // Fetch total moments count
        const { count: totalMoments, error: momentsError } = await supabase
          .from('moments')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (momentsError) {
          logger.error('Error fetching moments count', 'useUserStats', momentsError);
          throw momentsError;
        }

        // Fetch last moment date
        const { data: lastMoment, error: lastMomentError } = await supabase
          .from('moments')
          .select('date')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(1)
          .single();

        if (lastMomentError && lastMomentError.code !== 'PGRST116') {
          logger.error('Error fetching last moment', 'useUserStats', lastMomentError);
        }

        // Fetch user profile creation date
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('created_at')
          .eq('id', user.id)
          .single();

        if (profileError) {
          logger.error('Error fetching user profile', 'useUserStats', profileError);
        }

        return {
          totalMoments: totalMoments || 0,
          lastMomentDate: lastMoment ? new Date(lastMoment.date) : null,
          memberSince: profile ? new Date(profile.created_at) : null
        };
      } catch (error) {
        logger.error('Error in useUserStats', 'useUserStats', error);
        throw error;
      }
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2
  });
};