
import { Button } from '@/components/ui/button';
import { List, Calendar } from 'lucide-react';

interface ViewModeToggleProps {
  viewMode: 'list' | 'timeline';
  onViewModeChange: (mode: 'list' | 'timeline') => void;
}

const ViewModeToggle = ({ viewMode, onViewModeChange }: ViewModeToggleProps) => {
  return (
    <div className="flex justify-center gap-2 flex-wrap">
      <Button
        variant={viewMode === 'list' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewModeChange('list')}
        className={viewMode === 'list' ? 'bg-rose-400 hover:bg-rose-500' : 'border-sage-200 text-sage-600 hover:bg-sage-50'}
      >
        <List className="w-4 h-4 mr-2" />
        Lista
      </Button>
      <Button
        variant={viewMode === 'timeline' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewModeChange('timeline')}
        className={viewMode === 'timeline' ? 'bg-rose-400 hover:bg-rose-500' : 'border-sage-200 text-sage-600 hover:bg-sage-50'}
      >
        <Calendar className="w-4 h-4 mr-2" />
        Línea de tiempo
      </Button>
    </div>
  );
};

export default ViewModeToggle;
