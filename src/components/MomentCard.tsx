
import React, { useState, memo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Image, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DeleteMomentDialog from './DeleteMomentDialog';
import LazyImage from './LazyImage';

interface Moment {
  id: string;
  title: string;
  note: string;
  date: Date;
  photo?: string;
}

interface MomentCardProps {
  moment: Moment;
  onClick: () => void;
  onDelete: (momentId: string) => void;
}

const MomentCard = memo(({ moment, onClick, onDelete }: MomentCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    onDelete(moment.id);
    setShowDeleteDialog(false);
  };

  // Memoizar el formato de fecha
  const formattedDate = React.useMemo(() => 
    format(moment.date, "d 'de' MMMM, yyyy", { locale: es }),
    [moment.date]
  );

  return (
    <>
      <div 
        onClick={onClick}
        className="bg-card paper-texture rounded-xl p-4 sm:p-6 gentle-shadow hover:shadow-lg transition-all duration-300 cursor-pointer active:scale-[0.98] sm:hover:scale-[1.02] border border-sage-200/30 group relative touch-manipulation"
      >
        {/* Botón de eliminar - Optimizado para móvil */}
        <div className="absolute top-3 right-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDeleteClick}
            className="h-9 w-9 sm:h-8 sm:w-8 bg-white/90 hover:bg-red-50 hover:text-red-600 shadow-sm touch-manipulation"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-start gap-4">
          {moment.photo ? (
            <LazyImage 
              src={moment.photo} 
              alt={moment.title}
              className="w-16 h-16 sm:w-16 sm:h-16 rounded-lg flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 sm:w-16 sm:h-16 rounded-lg bg-sage-100 flex items-center justify-center flex-shrink-0">
              <Image className="w-6 h-6 text-sage-400" />
            </div>
          )}
          
          <div className="flex-1 min-w-0 pr-2 sm:pr-0">
            <h3 className="font-serif-elegant text-lg sm:text-lg text-sage-800 mb-2 leading-snug line-clamp-2">
              {moment.title}
            </h3>
            
            <p className="text-sage-600 text-base sm:text-sm mb-3 line-clamp-2 whitespace-pre-wrap leading-relaxed">
              {moment.note}
            </p>
            
            <time className="text-sm sm:text-xs text-sage-500 handwritten">
              {formattedDate}
            </time>
          </div>
        </div>
      </div>

      <DeleteMomentDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleConfirmDelete}
        momentTitle={moment.title}
      />
    </>
  );
});

MomentCard.displayName = 'MomentCard';

export default MomentCard;
