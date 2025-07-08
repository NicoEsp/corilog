import { supabase } from '@/integrations/supabase/client';
import { Moment, CreateMomentData } from '@/types/moment';
import { sanitizeTitle, sanitizeNote, validateDate } from '@/utils/inputSanitization';
import { getSecureErrorMessage, logError } from '@/utils/errorHandling';

export class MomentService {
  static async fetchMoments(userId: string, limit: number = 20, offset: number = 0): Promise<Moment[]> {
    try {
      // Query optimizada usando el índice (is_featured DESC, date DESC)
      const { data, error } = await supabase
        .from('moments')
        .select('*')
        .eq('user_id', userId)
        .order('is_featured', { ascending: false })
        .order('date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        logError(error, 'fetch_moments');
        console.error('Error fetching moments:', getSecureErrorMessage(error));
        return [];
      }

      return data.map(moment => ({
        ...moment,
        date: new Date(moment.date)
      }));
    } catch (error) {
      logError(error, 'fetch_moments_general');
      console.error('General error fetching moments:', error);
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
    console.log('🔄 Iniciando creación de momento en el servidor');
    
    // Sanitize and validate input
    const sanitizedTitle = sanitizeTitle(momentData.title);
    const sanitizedNote = sanitizeNote(momentData.note || '');

    if (!sanitizedTitle.trim()) {
      console.error('❌ Error de validación: título requerido');
      throw new Error('El título es requerido');
    }

    if (!validateDate(momentData.date)) {
      console.error('❌ Error de validación: fecha inválida');
      throw new Error('La fecha no es válida');
    }

    try {
      const { data, error } = await supabase
        .from('moments')
        .insert([{
          title: sanitizedTitle,
          note: sanitizedNote,
          date: momentData.date.toISOString().split('T')[0],
          photo: momentData.photo,
          user_id: userId,
          is_featured: false
        }])
        .select()
        .single();

      if (error) {
        logError(error, 'add_moment');
        console.error('❌ Error creando momento:', getSecureErrorMessage(error));
        throw new Error(getSecureErrorMessage(error));
      }

      console.log('✅ Momento creado exitosamente en la base de datos');

      // NO mostrar toast aquí - se maneja en el hook con optimistic update
      return {
        ...data,
        date: new Date(data.date)
      };
    } catch (error) {
      logError(error, 'add_moment_general');
      console.error('❌ Error general creando momento:', error);
      throw error;
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
        console.error('Error deleting moment:', getSecureErrorMessage(error));
        return false;
      }

      console.log('✅ Momento eliminado exitosamente');
      return true;
    } catch (error) {
      logError(error, 'delete_moment_general');
      console.error('General error deleting moment:', error);
      return false;
    }
  }

  static async toggleFeaturedMoment(userId: string, momentId: string, isFeatured: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('moments')
        .update({ is_featured: isFeatured })
        .eq('id', momentId)
        .eq('user_id', userId);

      if (error) {
        logError(error, 'toggle_featured_moment');
        console.error('Error toggling featured moment:', getSecureErrorMessage(error));
        return false;
      }

      console.log(`✅ Momento ${isFeatured ? 'destacado' : 'no destacado'} exitosamente`);
      return true;
    } catch (error) {
      logError(error, 'toggle_featured_moment_general');
      console.error('General error toggling featured moment:', error);
      return false;
    }
  }
}
