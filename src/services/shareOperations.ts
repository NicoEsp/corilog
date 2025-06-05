
import { supabase } from '@/integrations/supabase/client';
import { SharedMoment, CreateSharedMomentData } from '@/types/sharedMoment';
import { toast } from '@/hooks/use-toast';
import { logError, getSecureErrorMessage } from '@/utils/errorHandling';
import { validateEmail, sanitizeText, shareRateLimit } from '@/utils/securityUtils';

export class ShareOperations {
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
