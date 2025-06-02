import { supabase } from '@/integrations/supabase/client';
import { Moment, CreateMomentData } from '@/types/moment';
import { toast } from '@/hooks/use-toast';
import { sanitizeTitle, sanitizeNote, validateDate } from '@/utils/inputSanitization';
import { getSecureErrorMessage, logError } from '@/utils/errorHandling';

export class MomentService {
  static async fetchMoments(userId: string, limit: number = 20, offset: number = 0): Promise<Moment[]> {
    try {
      // Query optimizada usando el índice (user_id, date DESC)
      const { data, error } = await supabase
        .from('moments')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        logError(error, 'fetch_moments');
        toast({
          title: "Error",
          description: getSecureErrorMessage(error),
          variant: "destructive",
        });
        return [];
      }

      return data.map(moment => ({
        ...moment,
        date: new Date(moment.date)
      }));
    } catch (error) {
      logError(error, 'fetch_moments_general');
      return [];
    }
  }

  static async fetchMomentsCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('moments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) {
        logError(error, 'fetch_moments_count');
        return 0;
      }

      return count || 0;
    } catch (error) {
      logError(error, 'fetch_moments_count_general');
      return 0;
    }
  }

  static async createMoment(userId: string, momentData: CreateMomentData): Promise<Moment | null> {
    // Sanitize and validate input
    const sanitizedTitle = sanitizeTitle(momentData.title);
    const sanitizedNote = sanitizeNote(momentData.note);

    if (!sanitizedTitle.trim()) {
      toast({
        title: "Error de validación",
        description: "El título es requerido",
        variant: "destructive",
      });
      return null;
    }

    if (!sanitizedNote.trim()) {
      toast({
        title: "Error de validación",
        description: "La nota es requerida",
        variant: "destructive",
      });
      return null;
    }

    if (!validateDate(momentData.date)) {
      toast({
        title: "Error de validación",
        description: "La fecha no es válida",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('moments')
        .insert([{
          title: sanitizedTitle,
          note: sanitizedNote,
          date: momentData.date.toISOString().split('T')[0],
          photo: momentData.photo,
          user_id: userId
        }])
        .select()
        .single();

      if (error) {
        logError(error, 'add_moment');
        toast({
          title: "Error",
          description: getSecureErrorMessage(error),
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "¡Momento guardado!",
        description: "Tu momento ha sido guardado exitosamente",
      });

      return {
        ...data,
        date: new Date(data.date)
      };
    } catch (error) {
      logError(error, 'add_moment_general');
      return null;
    }
  }

  static async deleteMoment(userId: string, momentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('moments')
        .delete()
        .eq('id', momentId)
        .eq('user_id', userId);

      if (error) {
        logError(error, 'delete_moment');
        toast({
          title: "Error",
          description: getSecureErrorMessage(error),
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Momento eliminado",
        description: "Tu momento ha sido eliminado exitosamente",
      });

      return true;
    } catch (error) {
      logError(error, 'delete_moment_general');
      return false;
    }
  }
}
