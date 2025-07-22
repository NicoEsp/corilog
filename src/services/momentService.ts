import { supabase } from '@/integrations/supabase/client';
import { Moment, CreateMomentData } from '@/types/moment';
import { sanitizeTitle, sanitizeNote, validateDate } from '@/utils/inputSanitization';
import { getSecureErrorMessage } from '@/utils/errorHandling';
import { logger } from '@/utils/logger';
import { formatDateForDatabase } from '@/utils/dateUtils';
import { APP_CONFIG } from '@/config/constants';

export class MomentService {
  static async fetchMoments(userId: string, limit: number = APP_CONFIG.MOMENTS_PER_PAGE, offset: number = 0): Promise<Moment[]> {
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
        logger.error('Error fetching moments', 'fetch_moments', error);
        return [];
      }

      return data.map(moment => ({
        ...moment,
        date: new Date(moment.date)
      }));
    } catch (error) {
      logger.error('General error fetching moments', 'fetch_moments_general', error);
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
        logger.error('Error fetching moments count', 'fetch_moments_count', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      logger.error('General error fetching moments count', 'fetch_moments_count_general', error);
      return 0;
    }
  }

  static async createMoment(userId: string, momentData: CreateMomentData): Promise<Moment | null> {
    logger.info('Starting moment creation', 'createMoment');
    
    // Sanitize and validate input
    const sanitizedTitle = sanitizeTitle(momentData.title);
    const sanitizedNote = sanitizeNote(momentData.note || '');

    if (!sanitizedTitle.trim()) {
      logger.error('Validation error: title required', 'createMoment');
      throw new Error('El título es requerido');
    }

    if (!validateDate(momentData.date)) {
      logger.error('Validation error: invalid date', 'createMoment');
      throw new Error('La fecha no es válida');
    }

    try {
      // Usar la nueva función para formatear la fecha sin conversión UTC
      const formattedDate = formatDateForDatabase(momentData.date);
      
      logger.info('Creating moment with date', 'createMoment', {
        originalDate: momentData.date,
        formattedDate: formattedDate
      });

      const { data, error } = await supabase
        .from('moments')
        .insert([{
          title: sanitizedTitle,
          note: sanitizedNote,
          date: formattedDate,
          photo: momentData.photo,
          user_id: userId,
          is_featured: false
        }])
        .select()
        .single();

      if (error) {
        logger.error('Error creating moment', 'add_moment', error);
        throw new Error(getSecureErrorMessage(error));
      }

      logger.info('Moment created successfully', 'add_moment');

      // NO mostrar toast aquí - se maneja en el hook con optimistic update
      return {
        ...data,
        date: new Date(data.date)
      };
    } catch (error) {
      logger.error('General error creating moment', 'add_moment_general', error);
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
        logger.error('Error deleting moment', 'delete_moment', error);
        return false;
      }

      logger.info('Moment deleted successfully', 'delete_moment');
      return true;
    } catch (error) {
      logger.error('General error deleting moment', 'delete_moment_general', error);
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
        logger.error('Error toggling featured moment', 'toggle_featured_moment', error);
        return false;
      }

      logger.info(`Moment ${isFeatured ? 'featured' : 'unfeatured'} successfully`, 'toggle_featured_moment');
      return true;
    } catch (error) {
      logger.error('General error toggling featured moment', 'toggle_featured_moment_general', error);
      return false;
    }
  }
}
