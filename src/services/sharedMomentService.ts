import { supabase } from '@/integrations/supabase/client';
import { SharedMoment, CreateSharedMomentData, SharedMomentAccess } from '@/types/sharedMoment';
import { toast } from '@/hooks/use-toast';
import { getSecureErrorMessage, logError } from '@/utils/errorHandling';

export class SharedMomentService {
  static async createSharedMoment(userId: string, data: CreateSharedMomentData): Promise<SharedMoment | null> {
    try {
      const { data: sharedMoment, error } = await supabase
        .from('shared_moments')
        .insert([{
          moment_id: data.moment_id,
          shared_by_user_id: userId,
          recipient_email_1: data.recipient_email_1.toLowerCase().trim(),
          recipient_email_2: data.recipient_email_2?.toLowerCase().trim() || null,
          expires_at: data.expires_at?.toISOString() || null,
        }])
        .select()
        .single();

      if (error) {
        logError(error, 'create_shared_moment');
        toast({
          title: "Error",
          description: getSecureErrorMessage(error),
          variant: "destructive",
        });
        return null;
      }

      return sharedMoment;
    } catch (error) {
      logError(error, 'create_shared_moment_general');
      return null;
    }
  }

  static async getSharedMomentsByUser(userId: string): Promise<SharedMoment[]> {
    try {
      const { data, error } = await supabase
        .from('shared_moments')
        .select('*')
        .eq('shared_by_user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        logError(error, 'get_shared_moments_by_user');
        return [];
      }

      return data || [];
    } catch (error) {
      logError(error, 'get_shared_moments_by_user_general');
      return [];
    }
  }

  static async sendInvitations(shareToken: string, recipientEmails: string[], momentTitle: string, senderName: string): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke('send-invitation', {
        body: {
          shareToken,
          recipientEmails,
          momentTitle,
          senderName,
        }
      });

      if (error) {
        logError(error, 'send_invitations');
        toast({
          title: "Error enviando invitaciones",
          description: getSecureErrorMessage(error),
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "¡Invitaciones enviadas!",
        description: `Se han enviado ${recipientEmails.length} invitación(es) exitosamente`,
      });

      return true;
    } catch (error) {
      logError(error, 'send_invitations_general');
      return false;
    }
  }

  static async getSharedMomentAccess(shareToken: string, email: string): Promise<SharedMomentAccess | null> {
    try {
      const { data, error } = await supabase.functions.invoke('validate-shared-access', {
        body: {
          shareToken,
          email: email.toLowerCase().trim(),
        }
      });

      if (error) {
        logError(error, 'get_shared_moment_access');
        return null;
      }

      return data;
    } catch (error) {
      logError(error, 'get_shared_moment_access_general');
      return null;
    }
  }

  static async deactivateSharedMoment(userId: string, sharedMomentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('shared_moments')
        .update({ is_active: false })
        .eq('id', sharedMomentId)
        .eq('shared_by_user_id', userId);

      if (error) {
        logError(error, 'deactivate_shared_moment');
        toast({
          title: "Error",
          description: getSecureErrorMessage(error),
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Compartir desactivado",
        description: "El momento ya no está disponible para los invitados",
      });

      return true;
    } catch (error) {
      logError(error, 'deactivate_shared_moment_general');
      return false;
    }
  }
}