
import { supabase } from '@/integrations/supabase/client';
import { SharedMoment } from '@/types/sharedMoment';
import { Moment } from '@/types/moment';
import { SharedMomentWithDetails } from '@/types/shareTypes';
import { logError } from '@/utils/errorHandling';

export class SharedMomentRetrieval {
  static async getSharedMoment(shareToken: string): Promise<{ moment: Moment; sharedBy: string } | null> {
    try {
      // Use the secure function instead of direct query
      const result = await supabase
        .rpc('get_shared_moment_with_details', { token_param: shareToken });

      const { data, error } = result;

      if (error) {
        logError(error, 'get_shared_moment');
        return null;
      }

      // Type assertion for the data
      const typedData = data as SharedMomentWithDetails[] | null;

      if (!typedData || typedData.length === 0) {
        return null;
      }

      const momentData = typedData[0];
      
      return {
        moment: {
          id: momentData.moment_id,
          title: momentData.moment_title,
          note: momentData.moment_note,
          date: new Date(momentData.moment_date),
          photo: momentData.moment_photo,
          user_id: '' // Not needed for shared moments
        },
        sharedBy: momentData.shared_by_name || momentData.shared_by_email || 'Usuario anónimo'
      };
    } catch (error) {
      logError(error, 'get_shared_moment_general');
      return null;
    }
  }

  static async getUserShares(userId: string): Promise<SharedMoment[]> {
    try {
      // Query optimizada con índice user_id, created_at DESC
      const { data, error } = await supabase
        .from('shared_moments')
        .select('*')
        .eq('shared_by_user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50); // Limitar resultados para mejor performance

      if (error) {
        logError(error, 'get_user_shares');
        return [];
      }

      return data || [];
    } catch (error) {
      logError(error, 'get_user_shares_general');
      return [];
    }
  }
}
