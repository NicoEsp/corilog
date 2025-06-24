
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
      {/* Punto en la línea */}
      <div className="absolute -left-16 top-4 w-3 h-3 bg-rose-400 rounded-full border-2 border-background shadow-sm"></div>

      {/* Card del momento */}
      <Card 
        className="bg-card paper-texture gentle-shadow hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02] border-sage-200/50 group"
        onClick={onClick}
      >
        <div className="p-4 sm:p-6">
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
                <h4 className="font-serif-elegant text-base sm:text-lg text-sage-800 leading-snug line-clamp-2">
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
