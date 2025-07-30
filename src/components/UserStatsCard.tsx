import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserStats } from '@/hooks/useUserStats';
import { useStreakData } from '@/hooks/useStreakData';
import { BookOpen, Calendar, Clock, Flame } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';

const UserStatsCard = () => {
  const { data: stats, isLoading } = useUserStats();
  const { currentStreak, isLoading: isLoadingStreak } = useStreakData();

  if (isLoading || isLoadingStreak) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="pb-4">
          <div className="h-6 w-32 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const formatMemberSince = (date: Date | null) => {
    if (!date) return 'Fecha no disponible';
    return format(date, 'MMMM yyyy', { locale: es });
  };

  const formatLastMoment = (date: Date | null) => {
    if (!date) return 'Sin momentos aún';
    return formatDistanceToNow(date, { addSuffix: true, locale: es });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-background to-muted/30 border-border/50 hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground">
          Tu viaje en Corilog
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Moments */}
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground tabular-nums">
              {stats.totalMoments}
            </div>
            <div className="text-sm text-muted-foreground">
              {stats.totalMoments === 1 ? 'momento' : 'momentos'}
            </div>
          </div>

          {/* Current Streak */}
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentStreak === 0 
                ? 'bg-muted/50' 
                : currentStreak >= 7 
                  ? 'bg-amber-50 border border-amber-200' 
                  : 'bg-rose-50 border border-rose-200'
            }`}>
              <Flame className={`h-5 w-5 ${
                currentStreak === 0 
                  ? 'text-muted-foreground' 
                  : currentStreak >= 7 
                    ? 'text-amber-600' 
                    : 'text-rose-600'
              }`} />
            </div>
            <div className="text-2xl font-bold text-foreground tabular-nums">
              {currentStreak}
            </div>
            <div className="text-sm text-muted-foreground">
              {currentStreak === 0 ? 'racha actual' : currentStreak === 1 ? 'día de racha' : 'días de racha'}
            </div>
            {currentStreak >= 7 && (
              <div className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full border border-amber-200">
                ¡Felicitaciones! Racha alcanzada
              </div>
            )}
          </div>

          {/* Last Moment */}
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div className="text-sm font-medium text-foreground leading-tight">
              {formatLastMoment(stats.lastMomentDate)}
            </div>
            <div className="text-sm text-muted-foreground">
              último momento
            </div>
          </div>

          {/* Member Since */}
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-accent-foreground" />
            </div>
            <div className="text-sm font-medium text-foreground leading-tight">
              {formatMemberSince(stats.memberSince)}
            </div>
            <div className="text-sm text-muted-foreground">
              miembro desde
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserStatsCard;