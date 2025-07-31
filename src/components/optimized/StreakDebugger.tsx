import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface DebugData {
  moments: any[];
  streak: any;
  calculation: any;
}

export const StreakDebugger = () => {
  const { user } = useAuth();
  const [debugData, setDebugData] = useState<DebugData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const debugStreak = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Get recent moments
      const { data: moments } = await supabase
        .from('moments')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(10);

      // Get current streak data
      const { data: streak } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Calculate streak manually
      const { data: calculation } = await supabase.rpc(
        'calculate_user_streak',
        { p_user_id: user.id }
      );

      setDebugData({
        moments: moments || [],
        streak,
        calculation: calculation?.[0]
      });

      console.log('🔍 STREAK DEBUG DATA:');
      console.log('Recent moments:', moments);
      console.log('Current streak record:', streak);
      console.log('Fresh calculation:', calculation?.[0]);
    } catch (error) {
      console.error('Error debugging streak:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const forceUpdateStreak = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc(
        'update_user_streak_optimized',
        { p_user_id: user.id }
      );

      if (error) {
        console.error('Error forcing streak update:', error);
      } else {
        console.log('✅ Forced streak update result:', data?.[0]);
        // Refresh debug data
        debugStreak();
      }
    } catch (error) {
      console.error('Error in force update:', error);
    }
  };

  return (
    <Card className="p-4 mb-4 bg-yellow-50 border-yellow-200">
      <div className="space-y-3">
        <h3 className="font-semibold text-yellow-800">🔧 Streak Debugger</h3>
        
        <div className="flex gap-2">
          <Button 
            onClick={debugStreak} 
            disabled={isLoading}
            size="sm"
            variant="outline"
          >
            {isLoading ? 'Debugging...' : 'Debug Streak'}
          </Button>
          <Button 
            onClick={forceUpdateStreak}
            size="sm"
            variant="outline"
          >
            Force Update
          </Button>
        </div>

        {debugData && (
          <div className="space-y-3 text-sm">
            <div>
              <strong>Today's date:</strong> {new Date().toISOString().split('T')[0]}
            </div>
            
            <div>
              <strong>Latest moments:</strong>
              <ul className="mt-1 space-y-1">
                {debugData.moments.slice(0, 5).map((moment, i) => (
                  <li key={i} className="ml-4">
                    • {moment.date} - {moment.title} (created: {moment.created_at.split('T')[0]})
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <strong>Current streak record:</strong>
              {debugData.streak ? (
                <ul className="mt-1 space-y-1 ml-4">
                  <li>• Current: {debugData.streak.current_streak} days</li>
                  <li>• Last activity: {debugData.streak.last_activity_date}</li>
                  <li>• Updated at: {debugData.streak.updated_at}</li>
                </ul>
              ) : (
                <span className="text-red-600"> No streak record found!</span>
              )}
            </div>

            <div>
              <strong>Fresh calculation:</strong>
              {debugData.calculation ? (
                <ul className="mt-1 space-y-1 ml-4">
                  <li>• Calculated current: {debugData.calculation.current_streak} days</li>
                  <li>• Last activity: {debugData.calculation.last_activity_date}</li>
                  <li>• Streak start: {debugData.calculation.streak_start_date}</li>
                </ul>
              ) : (
                <span className="text-red-600"> Calculation failed!</span>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};