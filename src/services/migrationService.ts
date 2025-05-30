
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export class MigrationService {
  static async migrateMomentsFromLocalStorage(userId: string): Promise<void> {
    try {
      const localMoments = localStorage.getItem('corilog-moments');
      if (!localMoments) return;

      const parsedMoments = JSON.parse(localMoments);
      if (!Array.isArray(parsedMoments) || parsedMoments.length === 0) return;

      // Verificar si ya tiene momentos en Supabase
      const { data: existingMoments } = await supabase
        .from('moments')
        .select('id')
        .eq('user_id', userId);

      if (existingMoments && existingMoments.length > 0) {
        // Ya tiene momentos, no migrar
        return;
      }

      // Migrar momentos
      const momentsToInsert = parsedMoments.map((moment: any) => ({
        title: moment.title,
        note: moment.note,
        date: new Date(moment.date).toISOString().split('T')[0],
        photo: moment.photo,
        user_id: userId
      }));

      const { error } = await supabase
        .from('moments')
        .insert(momentsToInsert);

      if (!error) {
        // Limpiar localStorage después de migrar
        localStorage.removeItem('corilog-moments');
        
        toast({
          title: "¡Momentos migrados!",
          description: "Tus momentos han sido guardados en tu cuenta",
        });
      }
    } catch (error) {
      console.error('Error migrating moments:', error);
    }
  }
}
