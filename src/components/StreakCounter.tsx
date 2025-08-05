import { Flame, Info, Calendar } from 'lucide-react';
import { useStreak } from '@/hooks/useStreak';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePaginatedMomentsQuery } from '@/hooks/usePaginatedMomentsQuery';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface StreakCounterProps {
  className?: string;
}

const StreakCounter = ({ className = "" }: StreakCounterProps) => {
  const { currentStreak, isLoading } = useStreak();
  const { moments } = usePaginatedMomentsQuery(1); // Get last moment

  if (isLoading) {
    return (
      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full bg-background border border-border/50 ${className}`}>
        <Flame className="w-3.5 h-3.5 text-muted-foreground animate-pulse" />
        <span className="text-xs font-medium text-muted-foreground">...</span>
      </div>
    );
  }


  const getStreakColor = () => {
    if (currentStreak === 0) return 'text-muted-foreground bg-muted/50 border-border hover:bg-muted';
    if (currentStreak >= 30) return 'text-purple-600 bg-purple-50 border-purple-200';
    if (currentStreak >= 7) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  const getFlameColor = () => {
    if (currentStreak === 0) return 'text-muted-foreground';
    if (currentStreak >= 30) return 'text-purple-600';
    if (currentStreak >= 7) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getTooltipContent = () => {
    const lastMoment = moments?.[0];
    const lastMomentDate = lastMoment ? new Date(lastMoment.date) : null;
    
    if (currentStreak === 0) {
      if (!lastMoment) {
        return (
          <div className="space-y-2">
            <p className="font-medium">¡Comenzá tu primera racha!</p>
            <p className="text-xs">Creá momentos en días consecutivos para mantener una racha activa.</p>
          </div>
        );
      }
      
      return (
        <div className="space-y-2">
          <p className="font-medium">Racha actual: 0 días</p>
          <div className="flex items-center gap-1 text-xs">
            <Calendar className="w-3 h-3" />
            <span>Último momento: {formatDistanceToNow(lastMomentDate!, { locale: es, addSuffix: true })}</span>
          </div>
          <p className="text-xs">Para continuar tu racha, creá un momento hoy.</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        <p className="font-medium">¡Excelente racha de {currentStreak} días!</p>
        <p className="text-xs">Seguí creando momentos cada día para mantenerla activa.</p>
        {lastMomentDate && (
          <div className="flex items-center gap-1 text-xs">
            <Calendar className="w-3 h-3" />
            <span>Último momento: {formatDistanceToNow(lastMomentDate, { locale: es, addSuffix: true })}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full border transition-all duration-300 hover:scale-105 cursor-help ${getStreakColor()} ${className}`}>
            <Flame className={`w-3.5 h-3.5 ${getFlameColor()}`} />
            <span className="text-xs font-medium">
              {currentStreak}
              {/* Mobile abbreviated text */}
              <span className="sm:hidden ml-1">
                {currentStreak === 0 ? 'Comenzá' : 'Momentos'}
              </span>
              {/* Desktop full text */}
              <span className="hidden sm:inline ml-1">
                {currentStreak === 0 ? 'Comenzá tu racha' : currentStreak === 1 ? 'momento' : 'momentos'}
              </span>
            </span>
            <Info className="w-3 h-3 opacity-60" />
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          {getTooltipContent()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default StreakCounter;