
import { supabase } from '@/integrations/supabase/client';
import { SharedMoment, CreateSharedMomentData } from '@/types/sharedMoment';
import { Moment } from '@/types/moment';
import { toast } from '@/hooks/use-toast';
import { logError, getSecureErrorMessage } from '@/utils/errorHandling';

export class ShareService {
  static async createShare(userId: string, shareData: CreateSharedMomentData, senderName?: string): Promise<SharedMoment | null> {
    try {
      const { data, error } = await supabase
        .from('shared_moments')
        .insert([{
          moment_id: shareData.moment_id,
          shared_by_user_id: userId,
          shared_with_email: shareData.shared_with_email
        }])
        .select()
        .single();

      if (error) {
        logError(error, 'create_share');
        toast({
          title: "Error",
          description: getSecureErrorMessage(error),
          variant: "destructive",
        });
        return null;
      }

      // Get moment details for email
      const { data: momentData, error: momentError } = await supabase
        .from('moments')
        .select('title')
        .eq('id', shareData.moment_id)
        .single();

      if (momentError) {
        logError(momentError, 'get_moment_for_share');
      }

      // Send invitation email
      try {
        const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-invitation', {
          body: {
            shareToken: data.share_token,
            recipientEmail: shareData.shared_with_email,
            momentTitle: momentData?.title || 'Momento especial',
            senderName: senderName || 'Un amigo'
          }
        });

        if (emailError) {
          console.error('Error sending invitation email:', emailError);
          toast({
            title: "Momento compartido",
            description: `El momento ha sido compartido con ${shareData.shared_with_email}, pero no se pudo enviar el email de invitación.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "¡Momento compartido!",
            description: `El momento ha sido compartido con ${shareData.shared_with_email} y se ha enviado una invitación por email.`,
          });
        }
      } catch (emailError) {
        console.error('Error invoking email function:', emailError);
        toast({
          title: "Momento compartido",
          description: `El momento ha sido compartido con ${shareData.shared_with_email}, pero no se pudo enviar el email de invitación.`,
          variant: "destructive",
        });
      }

      return data;
    } catch (error) {
      logError(error, 'create_share_general');
      return null;
    }
  }

  static async getSharedMoment(shareToken: string): Promise<{ moment: Moment; sharedBy: string } | null> {
    try {
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
        logError(error, 'get_shared_moment');
        return null;
      }

      if (!data.moments) {
        return null;
      }

      const profile = data.user_profiles as any;
      const sharedByName = profile?.display_name || profile?.email || 'Usuario anónimo';

      return {
        moment: {
          ...data.moments,
          date: new Date(data.moments.date)
        },
        sharedBy: sharedByName
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
}
