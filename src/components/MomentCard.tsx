import React, { useState, memo, useMemo, useCallback } from 'react';
import { Image, Trash2, Share } from 'lucide-react';
import { formatDate } from '@/utils/dateUtils';
import { Button } from '@/components/ui/button';
import DeleteMomentDialog from './DeleteMomentDialog';
import ShareMomentModal from './ShareMomentModal';
import FeaturedButton from './FeaturedButton';
import LazyImage from './LazyImage';
interface Moment {
  id: string;
  title: string;
  note: string;
  date: Date;
  photo?: string;
  is_featured: boolean;
}
interface MomentCardProps {
  moment: Moment;
  onClick: () => void;
  onDelete: (momentId: string) => void;
  onToggleFeatured: (momentId: string, isFeatured: boolean) => void;
}
const MomentCard = memo(({
  moment,
  onClick,
  onDelete,
  onToggleFeatured
}: MomentCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  // Memoizar callbacks para evitar re-renders
  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  }, []);

  const handleShareClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShareModal(true);
  }, []);

  const handleToggleFeatured = useCallback(() => {
    onToggleFeatured(moment.id, !moment.is_featured);
  }, [onToggleFeatured, moment.id, moment.is_featured]);

  const handleConfirmDelete = useCallback(() => {
    onDelete(moment.id);
    setShowDeleteDialog(false);
  }, [onDelete, moment.id]);

  // Memoizar datos computados
  const formattedDate = useMemo(() => formatDate(moment.date, 'DISPLAY'), [moment.date]);
  
  const cardClassName = useMemo(() => {
    const baseClasses = "bg-card paper-texture rounded-xl p-4 sm:p-6 transition-all duration-300 cursor-pointer active:scale-[0.98] border group relative touch-manipulation";
    const featuredClasses = "featured-shimmer featured-glow hover:featured-glow-intense border-amber-400/80 bg-gradient-to-br from-amber-50/50 via-yellow-50/30 to-amber-50/20 sm:hover:scale-[1.03]";
    const normalClasses = "gentle-shadow hover:shadow-lg border-sage-200/30 sm:hover:scale-[1.02]";
    
    return `${baseClasses} ${moment.is_featured ? featuredClasses : normalClasses}`;
  }, [moment.is_featured]);
  return <>
      <div onClick={onClick} className={cardClassName}>
        {/* Indicador de destacado mejorado */}
        {moment.is_featured && (
          <div className="absolute top-2 left-2 w-6 h-6 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center featured-star shadow-lg z-20">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        )}

        {/* Botones de acción - Optimizado para móvil */}
        <div className="absolute top-3 right-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 z-10 flex gap-1">
          <FeaturedButton isFeatured={moment.is_featured} onToggle={handleToggleFeatured} className="h-9 w-9 sm:h-8 sm:w-8 bg-white/90 shadow-sm touch-manipulation" />
          <Button variant="ghost" size="icon" onClick={handleShareClick} className="h-9 w-9 sm:h-8 sm:w-8 bg-white/90 hover:bg-blue-50 hover:text-blue-600 shadow-sm touch-manipulation">
            <Share className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDeleteClick} className="h-9 w-9 sm:h-8 sm:w-8 bg-white/90 hover:bg-red-50 hover:text-red-600 shadow-sm touch-manipulation">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-start gap-4">
          {moment.photo ? <LazyImage src={moment.photo} alt={moment.title} className="w-16 h-16 sm:w-16 sm:h-16 rounded-lg flex-shrink-0" /> : <div className="w-16 h-16 sm:w-16 sm:h-16 rounded-lg bg-sage-100 flex items-center justify-center flex-shrink-0">
              <Image className="w-6 h-6 text-sage-400" />
            </div>}
          
          <div className="flex-1 min-w-0 pr-2 sm:pr-0">
            <h3 className={`font-serif-elegant text-lg sm:text-lg mb-2 leading-snug line-clamp-2 ${moment.is_featured ? 'text-amber-900 font-semibold text-shadow-sm' : 'text-sage-800'}`}>
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

      <DeleteMomentDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog} onConfirm={handleConfirmDelete} momentTitle={moment.title} />

      <ShareMomentModal moment={moment} open={showShareModal} onOpenChange={setShowShareModal} />
    </>;
});
MomentCard.displayName = 'MomentCard';
export default MomentCard;