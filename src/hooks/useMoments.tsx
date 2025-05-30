
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MomentService } from '@/services/momentService';
import { MigrationService } from '@/services/migrationService';
import { Moment, CreateMomentData } from '@/types/moment';

export const useMoments = () => {
  const { user } = useAuth();
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadMoments();
      // Migrar momentos del localStorage si existen
      MigrationService.migrateMomentsFromLocalStorage(user.id);
    }
  }, [user]);

  const loadMoments = async () => {
    if (!user) return;
    
    setLoading(true);
    const fetchedMoments = await MomentService.fetchMoments(user.id);
    setMoments(fetchedMoments);
    setLoading(false);
  };

  const addMoment = async (momentData: CreateMomentData): Promise<boolean> => {
    if (!user) return false;

    const newMoment = await MomentService.createMoment(user.id, momentData);
    if (newMoment) {
      setMoments(prev => [newMoment, ...prev]);
      return true;
    }
    return false;
  };

  const deleteMoment = async (momentId: string): Promise<boolean> => {
    if (!user) return false;

    const success = await MomentService.deleteMoment(user.id, momentId);
    if (success) {
      setMoments(prev => prev.filter(moment => moment.id !== momentId));
      return true;
    }
    return false;
  };

  return {
    moments,
    loading,
    addMoment,
    deleteMoment
  };
};
