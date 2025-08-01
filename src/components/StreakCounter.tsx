import { Flame } from 'lucide-react';
import { useStreak } from '@/hooks/useStreak';

interface StreakCounterProps {
  className?: string;
}

const StreakCounter = ({ className = "" }: StreakCounterProps) => {
  const { currentStreak, isLoading } = useStreak();

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

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full border transition-all duration-300 hover:scale-105 ${getStreakColor()} ${className}`}>
      <Flame className={`w-3.5 h-3.5 ${getFlameColor()}`} />
      <span className="text-xs font-medium">
        {currentStreak}
        {/* Mobile abbreviated text */}
        <span className="sm:hidden ml-1">
          {currentStreak === 0 ? 'Comenzá' : 'Momentos'}
        </span>
        {/* Desktop full text */}
        <span className="hidden sm:inline ml-1">
          {currentStreak === 0 ? 'Comenzá' : currentStreak === 1 ? 'momento' : 'momentos'}
        </span>
      </span>
    </div>
  );
};

export default StreakCounter;