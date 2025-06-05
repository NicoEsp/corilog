
import { supabase } from '@/integrations/supabase/client';
import { SharedMoment, CreateSharedMomentData } from '@/types/sharedMoment';
import { Moment } from '@/types/moment';
import { toast } from '@/hooks/use-toast';
import { logError, getSecureErrorMessage } from '@/utils/errorHandling';
import { validateEmail, sanitizeText, shareRateLimit } from '@/utils/securityUtils';

// Type for the RPC function response
interface SharedMomentWithDetails {
  moment_id: string;
  moment_title: string;
  moment_note: string;
  moment_date: string;
  moment_photo: string | null;
  shared_by_name: string | null;
  shared_by_email: string | null;
}

export class ShareService {
  static async createShare(userId: string, shareData: CreateSharedMomentData, senderName?: string): Promise<SharedMoment | null> {
    try {
      // Enhanced input validation
      if (!validateEmail(shareData.shared_with_email)) {
        toast({
          title: "Error de validación",
          description: "El formato del email no es válido",
          variant: "destructive",
        });
        return null;
      }

      // Check client-side rate limiting
      const rateLimitKey = `share_${userId}`;
      if (!shareRateLimit.check(rateLimitKey)) {
        const remainingTime = Math.ceil(shareRateLimit.getRemainingTime(rateLimitKey) / 60000);
        toast({
          title: "Límite de compartir alcanzado",
          description: `Has alcanzado el límite de compartir. Intenta nuevamente en ${remainingTime} minutos.`,
          variant: "destructive",
        });
        return null;
      }

      // Sanitize email
      const sanitizedEmail = shareData.shared_with_email.toLowerCase().trim();

      const { data, error } = await supabase
        .from('shared_moments')
        .insert([{
          moment_id: shareData.moment_id,
          shared_by_user_id: userId,
          shared_with_email: sanitizedEmail
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

      // Sanitize sender name and moment title
      const sanitizedSender = senderName ? sanitizeText(senderName) : 'Un amigo';
      const sanitizedTitle = momentData?.title ? sanitizeText(momentData.title) : 'Momento especial';

      // Send invitation email with enhanced security
      try {
        const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-invitation', {
          body: {
            shareToken: data.share_token,
            recipientEmail: sanitizedEmail,
            momentTitle: sanitizedTitle,
            senderName: sanitizedSender
          }
        });

        if (emailError) {
          console.error('Error sending invitation email:', emailError);
          toast({
            title: "Momento compartido",
            description: `El momento ha sido compartido con ${sanitizedEmail}, pero no se pudo enviar el email de invitación.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "¡Momento compartido!",
            description: `El momento ha sido compartido con ${sanitizedEmail} y se ha enviado una invitación por email.`,
          });
        }
      } catch (emailError) {
        console.error('Error invoking email function:', emailError);
        toast({
          title: "Momento compartido",
          description: `El momento ha sido compartido con ${sanitizedEmail}, pero no se pudo enviar el email de invitación.`,
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
      // Use the secure function instead of direct query with proper typing
      const { data, error } = await supabase
        .rpc('get_shared_moment_with_details', { token_param: shareToken });

      if (error) {
        logError(error, 'get_shared_moment');
        return null;
      }

      if (!data || data.length === 0) {
        return null;
      }

      const momentData = data[0] as SharedMomentWithDetails;
      
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
