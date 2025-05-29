
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

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
        console.error('Error fetching moments:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los momentos",
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
      console.error('Error fetching moments:', error);
    }

    setLoading(false);
  };

  // Agregar nuevo momento
  const addMoment = async (newMoment: Omit<Moment, 'id' | 'user_id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('moments')
        .insert([{
          title: newMoment.title,
          note: newMoment.note,
          date: newMoment.date.toISOString().split('T')[0],
          photo: newMoment.photo,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding moment:', error);
        toast({
          title: "Error",
          description: "No se pudo guardar el momento",
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
      console.error('Error adding moment:', error);
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
