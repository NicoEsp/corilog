
import { supabase } from '@/integrations/supabase/client';
import { SharedMoment } from '@/types/sharedMoment';
import { Moment } from '@/types/moment';
import { toast } from '@/hooks/use-toast';
import { logError, getSecureErrorMessage } from '@/utils/errorHandling';

export class ShareService {
  static async createShareLink(userId: string, momentId: string): Promise<SharedMoment | null> {
    try {
      console.log('Creating share link for moment:', momentId, 'by user:', userId);
      
      const { data, error } = await supabase
        .from('shared_moments')
        .insert([{
          moment_id: momentId,
          shared_by_user_id: userId,
          shared_with_email: null // Ahora puede ser null
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating share link:', error);
        logError(error, 'create_share_link');
        toast({
          title: "Error al crear enlace",
          description: getSecureErrorMessage(error),
          variant: "destructive",
        });
        return null;
      }

      console.log('Share link created successfully:', data);
      return data;
    } catch (error) {
      console.error('General error creating share link:', error);
      logError(error, 'create_share_link_general');
      toast({
        title: "Error inesperado",
        description: "No se pudo crear el enlace de compartir. Inténtalo de nuevo.",
        variant: "destructive",
      });
      return null;
    }
  }

  static async getSharedMoment(shareToken: string): Promise<{ moment: Moment; sharedBy: string } | null> {
    try {
      console.log('Fetching shared moment with token:', shareToken);
      
      // Query optimizada usando JOIN en lugar de múltiples llamadas
      const { data, error } = await supabase
        .from('shared_moments')
        .select(`
          *,
          moments!inner (
            id,
            title,
            note,
            date,
            photo,
            user_id
          ),
          user_profiles!shared_by_user_id (
            display_name,
            email
          )
        `)
        .eq('share_token', shareToken)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error) {
        console.error('Error fetching shared moment:', error);
        logError(error, 'get_shared_moment');
        return null;
      }

      if (!data.moments) {
        console.log('No moment found for token:', shareToken);
        return null;
      }

      const profile = data.user_profiles as any;
      const sharedByName = profile?.display_name || profile?.email?.split('@')[0] || 'Usuario anónimo';

      console.log('Shared moment fetched successfully');
      return {
        moment: {
          ...data.moments,
          date: new Date(data.moments.date)
        },
        sharedBy: sharedByName
      };
    } catch (error) {
      console.error('General error fetching shared moment:', error);
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

  static async deleteShare(userId: string, shareId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('shared_moments')
        .delete()
        .eq('id', shareId)
        .eq('shared_by_user_id', userId);

      if (error) {
        logError(error, 'delete_share');
        toast({
          title: "Error",
          description: getSecureErrorMessage(error),
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Compartir eliminado",
        description: "El enlace de compartir ha sido eliminado",
      });

      return true;
    } catch (error) {
      logError(error, 'delete_share_general');
      return false;
    }
  }

  // Mantener compatibilidad con el método anterior
  static async createShare(userId: string, shareData: { moment_id: string; shared_with_email?: string }, senderName?: string): Promise<SharedMoment | null> {
    return this.createShareLink(userId, shareData.moment_id);
  }
}
