
import React, { useState, memo, useMemo, useCallback } from 'react';
import { Image, Trash2, Share } from 'lucide-react';
import { formatDate } from '@/utils/dateUtils';
import { Button } from '@/components/ui/button';
import DeleteMomentDialog from './DeleteMomentDialog';
import ShareMomentModal from './ShareMomentModal';
import FeaturedButton from './FeaturedButton';
import LazyImage from './LazyImage';
import { useIsMobile } from '@/hooks/use-mobile';

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

// Optimizar comparación para evitar re-renders innecesarios
const arePropsEqual = (prevProps: MomentCardProps, nextProps: MomentCardProps) => {
  return (
    prevProps.moment.id === nextProps.moment.id &&
    prevProps.moment.title === nextProps.moment.title &&
    prevProps.moment.note === nextProps.moment.note &&
    prevProps.moment.date.getTime() === nextProps.moment.date.getTime() &&
    prevProps.moment.photo === nextProps.moment.photo &&
    prevProps.moment.is_featured === nextProps.moment.is_featured &&
    prevProps.onClick === nextProps.onClick &&
    prevProps.onDelete === nextProps.onDelete &&
    prevProps.onToggleFeatured === nextProps.onToggleFeatured
  );
};

const MomentCard = memo(({
  moment,
  onClick,
  onDelete,
  onToggleFeatured
}: MomentCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const isMobile = useIsMobile();

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
    const baseClasses = "bg-card paper-texture rounded-xl transition-all duration-300 cursor-pointer border group relative touch-manipulation overflow-hidden";
    const featuredClasses = "featured-shimmer featured-glow hover:featured-glow-intense border-amber-400/80 bg-gradient-to-br from-amber-50/50 via-yellow-50/30 to-amber-50/20";
    const normalClasses = "gentle-shadow hover:shadow-lg border-sage-200/30";
    const responsiveClasses = isMobile 
      ? "p-4 active:scale-[0.98]" 
      : "p-6 hover:scale-[1.02]";
    
    return `${baseClasses} ${moment.is_featured ? featuredClasses : normalClasses} ${responsiveClasses}`;
  }, [moment.is_featured, isMobile]);

  return (
    <>
      <div onClick={onClick} className={cardClassName}>
        {/* Indicador de destacado */}
        {moment.is_featured && (
          <div className="absolute top-3 left-3 w-6 h-6 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center featured-star shadow-lg z-20">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        )}

        {/* Layout adaptativo: vertical en móvil, horizontal en desktop */}
        <div className={`flex ${isMobile ? 'flex-col' : 'flex-row items-start'} gap-4`}>
          {/* Imagen */}
          <div className={`flex-shrink-0 ${isMobile ? 'w-full' : 'w-16 h-16'}`}>
            {moment.photo ? (
              <LazyImage 
                src={moment.photo} 
                alt={moment.title} 
                className={`rounded-lg object-cover ${isMobile ? 'w-full h-32' : 'w-16 h-16'}`} 
              />
            ) : (
              <div className={`rounded-lg bg-sage-100 flex items-center justify-center ${isMobile ? 'w-full h-32' : 'w-16 h-16'}`}>
                <Image className={`text-sage-400 ${isMobile ? 'w-8 h-8' : 'w-6 h-6'}`} />
              </div>
            )}
          </div>
          
          {/* Contenido */}
          <div className={`flex-1 min-w-0 ${isMobile ? 'space-y-3' : 'pr-16'}`}>
            <h3 className={`font-serif-elegant leading-snug line-clamp-2 ${
              isMobile ? 'text-xl mb-2' : 'text-lg mb-2'
            } ${moment.is_featured ? 'text-amber-900 font-semibold text-shadow-sm' : 'text-sage-800'}`}>
              {moment.title}
            </h3>
            
            <p className={`text-sage-600 line-clamp-2 whitespace-pre-wrap leading-relaxed ${
              isMobile ? 'text-base mb-4' : 'text-sm mb-3'
            }`}>
              {moment.note}
            </p>
            
            <time className={`text-sage-500 handwritten block ${
              isMobile ? 'text-sm' : 'text-xs'
            }`}>
              {formattedDate}
            </time>
          </div>
        </div>

        {/* Botones de acción: barra inferior en móvil, flotantes en desktop */}
        {isMobile ? (
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-sage-100">
            <FeaturedButton 
              isFeatured={moment.is_featured} 
              onToggle={handleToggleFeatured} 
              className="h-10 w-10 bg-white/90 shadow-sm border border-sage-200/50" 
            />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleShareClick} 
              className="h-10 w-10 bg-white/90 hover:bg-blue-50 hover:text-blue-600 shadow-sm border border-sage-200/50"
            >
              <Share className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleDeleteClick} 
              className="h-10 w-10 bg-white/90 hover:bg-red-50 hover:text-red-600 shadow-sm border border-sage-200/50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 flex gap-1">
            <FeaturedButton 
              isFeatured={moment.is_featured} 
              onToggle={handleToggleFeatured} 
              className="h-8 w-8 bg-white/90 shadow-sm" 
            />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleShareClick} 
              className="h-8 w-8 bg-white/90 hover:bg-blue-50 hover:text-blue-600 shadow-sm"
            >
              <Share className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleDeleteClick} 
              className="h-8 w-8 bg-white/90 hover:bg-red-50 hover:text-red-600 shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <DeleteMomentDialog 
        open={showDeleteDialog} 
        onOpenChange={setShowDeleteDialog} 
        onConfirm={handleConfirmDelete} 
        momentTitle={moment.title} 
      />

      <ShareMomentModal 
        moment={moment} 
        open={showShareModal} 
        onOpenChange={setShowShareModal} 
      />
    </>
  );
}, arePropsEqual);

MomentCard.displayName = 'MomentCard';
export default MomentCard;
