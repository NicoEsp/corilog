
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { sanitizeTitle, sanitizeNote, validateDate } from '@/utils/inputSanitization';
import { getSecureErrorMessage, logError } from '@/utils/errorHandling';

export interface Moment {
  id: string;
  title: string;
  note: string;
  date: Date;
  photo?: string;
  user_id: string;
}

export const useMoments = () => {
  const { user } = useAuth();
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar momentos del usuario
  const fetchMoments = async () => {
    if (!user) {
      setMoments([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('moments')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        logError(error, 'fetch_moments');
        toast({
          title: "Error",
          description: getSecureErrorMessage(error),
          variant: "destructive",
        });
      } else {
        const formattedMoments = data.map(moment => ({
          ...moment,
          date: new Date(moment.date)
        }));
        setMoments(formattedMoments);
      }
    } catch (error) {
      logError(error, 'fetch_moments_general');
    }

    setLoading(false);
  };

  // Agregar nuevo momento con validación y sanitización
  const addMoment = async (newMoment: Omit<Moment, 'id' | 'user_id'>) => {
    if (!user) return false;

    // Sanitize and validate input
    const sanitizedTitle = sanitizeTitle(newMoment.title);
    const sanitizedNote = sanitizeNote(newMoment.note);

    if (!sanitizedTitle.trim()) {
      toast({
        title: "Error de validación",
        description: "El título es requerido",
        variant: "destructive",
      });
      return false;
    }

    if (!sanitizedNote.trim()) {
      toast({
        title: "Error de validación",
        description: "La nota es requerida",
        variant: "destructive",
      });
      return false;
    }

    if (!validateDate(newMoment.date)) {
      toast({
        title: "Error de validación",
        description: "La fecha no es válida",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('moments')
        .insert([{
          title: sanitizedTitle,
          note: sanitizedNote,
          date: newMoment.date.toISOString().split('T')[0],
          photo: newMoment.photo,
          user_id: user.id
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
        return false;
      }

      const formattedMoment = {
        ...data,
        date: new Date(data.date)
      };

      setMoments(prev => [formattedMoment, ...prev]);
      
      toast({
        title: "¡Momento guardado!",
        description: "Tu momento ha sido guardado exitosamente",
      });

      return true;
    } catch (error) {
      logError(error, 'add_moment_general');
      return false;
    }
  };

  // Migrar momentos desde localStorage (solo una vez)
  const migrateMomentsFromLocalStorage = async () => {
    if (!user) return;

    try {
      const localMoments = localStorage.getItem('corilog-moments');
      if (!localMoments) return;

      const parsedMoments = JSON.parse(localMoments);
      if (!Array.isArray(parsedMoments) || parsedMoments.length === 0) return;

      // Verificar si ya tiene momentos en Supabase
      const { data: existingMoments } = await supabase
        .from('moments')
        .select('id')
        .eq('user_id', user.id);

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
        user_id: user.id
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

        // Recargar momentos
        fetchMoments();
      }
    } catch (error) {
      console.error('Error migrating moments:', error);
    }
  };

  useEffect(() => {
    fetchMoments();
  }, [user]);

  useEffect(() => {
    if (user) {
      migrateMomentsFromLocalStorage();
    }
  }, [user]);

  return {
    moments,
    loading,
    addMoment,
    refetch: fetchMoments
  };
};
