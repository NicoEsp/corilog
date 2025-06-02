
import React, { useState, memo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Image, Trash2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DeleteMomentDialog from './DeleteMomentDialog';
import ShareMomentDialog from './ShareMomentDialog';

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
  const [showShareDialog, setShowShareDialog] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShareDialog(true);
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
        className="bg-card paper-texture rounded-xl p-4 sm:p-6 gentle-shadow hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02] border border-sage-200/30 group relative"
      >
        {/* Botones de acción - solo visibles en hover en desktop, siempre visibles en móvil */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 sm:opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShareClick}
            className="h-8 w-8 bg-white/80 hover:bg-blue-50 hover:text-blue-600"
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDeleteClick}
            className="h-8 w-8 bg-white/80 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-start gap-3 sm:gap-4">
          {moment.photo ? (
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-sage-100 flex-shrink-0">
              <img 
                src={moment.photo} 
                alt={moment.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-sage-100 flex items-center justify-center flex-shrink-0">
              <Image className="w-5 h-5 sm:w-6 sm:h-6 text-sage-400" />
            </div>
          )}
          
          <div className="flex-1 min-w-0 pr-8 sm:pr-0">
            <h3 className="font-serif-elegant text-base sm:text-lg text-sage-800 mb-1 sm:mb-2 leading-snug line-clamp-2">
              {moment.title}
            </h3>
            
            <p className="text-sage-600 text-sm mb-2 sm:mb-3 line-clamp-2 whitespace-pre-wrap">
              {moment.note}
            </p>
            
            <time className="text-xs text-sage-500 handwritten">
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

      <ShareMomentDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        momentId={moment.id}
        momentTitle={moment.title}
      />
    </>
  );
});

MomentCard.displayName = 'MomentCard';

export default MomentCard;
