
import React, { memo, useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Moment } from '@/types/moment';
import { Card } from '@/components/ui/card';
import { Image } from 'lucide-react';
import LazyImage from '@/components/LazyImage';

interface TimelineMomentItemProps {
  moment: Moment;
  onClick: () => void;
}

const TimelineMomentItem = memo(({ moment, onClick }: TimelineMomentItemProps) => {
  const formattedDate = useMemo(() => 
    format(moment.date, "d MMM", { locale: es }),
    [moment.date]
  );

  return (
    <div className="relative">
      {/* Punto en la línea - mejorado para destacados */}
      <div className={`absolute -left-16 top-4 rounded-full border-2 border-background shadow-lg ${
        moment.is_featured 
          ? 'w-4 h-4 bg-gradient-to-br from-amber-400 to-amber-500 featured-timeline-point' 
          : 'w-3 h-3 bg-rose-400'
      }`}>
        {moment.is_featured && (
          <div className="absolute inset-0 rounded-full bg-amber-300 opacity-50 animate-ping"></div>
        )}
      </div>

      {/* Card del momento */}
      <Card 
        className={`bg-card paper-texture transition-all duration-300 cursor-pointer border group ${
          moment.is_featured 
            ? 'featured-shimmer featured-glow hover:featured-glow-intense border-amber-400/80 bg-gradient-to-br from-amber-50/50 via-yellow-50/30 to-amber-50/20 hover:scale-[1.03]' 
            : 'gentle-shadow hover:shadow-lg border-sage-200/50 hover:scale-[1.02]'
        }`}
        onClick={onClick}
      >
        <div className="p-4 sm:p-6">
          {/* Indicador de destacado mejorado */}
          {moment.is_featured && (
            <div className="absolute top-2 right-2 w-5 h-5 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center featured-star shadow-lg z-10">
              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          )}
          
          <div className="flex items-start gap-3 sm:gap-4">
            {moment.photo ? (
              <LazyImage 
                src={moment.photo} 
                alt={moment.title}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-sage-100 flex items-center justify-center flex-shrink-0">
                <Image className="w-5 h-5 sm:w-6 sm:h-6 text-sage-400" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className={`font-serif-elegant text-base sm:text-lg leading-snug line-clamp-2 ${
                  moment.is_featured 
                    ? 'text-amber-900 font-semibold' 
                    : 'text-sage-800'
                }`}>
                  {moment.title}
                </h4>
                <time className="text-xs text-sage-500 handwritten flex-shrink-0">
                  {formattedDate}
                </time>
              </div>
              
              <p className="text-sage-600 text-sm line-clamp-2 whitespace-pre-wrap">
                {moment.note}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
});

TimelineMomentItem.displayName = 'TimelineMomentItem';

export default TimelineMomentItem;
