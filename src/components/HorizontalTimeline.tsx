
import React, { memo, useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Moment } from '@/types/moment';
import { Card } from '@/components/ui/card';
import { Image } from 'lucide-react';
import LazyImage from './LazyImage';

interface HorizontalTimelineProps {
  moments: Moment[];
  onMomentClick: (moment: Moment) => void;
}

const HorizontalTimeline = memo(({ moments, onMomentClick }: HorizontalTimelineProps) => {
  // Memoizar el agrupamiento por año para evitar recálculos
  const momentsByYear = useMemo(() => {
    return moments.reduce((acc, moment) => {
      const year = moment.date.getFullYear();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(moment);
      return acc;
    }, {} as Record<number, Moment[]>);
  }, [moments]);

  const years = useMemo(() => 
    Object.keys(momentsByYear)
      .map(Number)
      .sort((a, b) => b - a),
    [momentsByYear]
  );

  if (moments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sage-500 handwritten">
          Tu línea de tiempo aparecerá aquí cuando tengas momentos guardados
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Línea horizontal principal */}
      <div className="absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-sage-300 via-sage-400 to-sage-300"></div>
      
      {/* Contenedor con scroll horizontal */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-8 min-w-max px-4">
          {years.map((year) => (
            <YearSection 
              key={year} 
              year={year} 
              moments={momentsByYear[year]} 
              onMomentClick={onMomentClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

// Componente memoizado para cada sección de año
const YearSection = memo(({ year, moments, onMomentClick }: {
  year: number;
  moments: Moment[];
  onMomentClick: (moment: Moment) => void;
}) => (
  <div className="flex flex-col items-center min-w-[300px]">
    {/* Marcador del año en la línea */}
    <div className="relative mb-4">
      <div className="w-6 h-6 bg-rose-400 rounded-full border-4 border-background shadow-sm z-10 relative"></div>
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
        <div className="bg-background/95 backdrop-blur-sm px-3 py-1 rounded-full border border-sage-200/50 shadow-sm">
          <h3 className="font-serif-elegant text-base text-sage-800">{year}</h3>
        </div>
      </div>
    </div>

    {/* Momentos del año en columna vertical */}
    <div className="space-y-4 mt-12 w-full">
      {moments.slice(0, 4).map((moment) => (
        <HorizontalMomentItem 
          key={moment.id} 
          moment={moment} 
          onClick={() => onMomentClick(moment)}
        />
      ))}
      {moments.length > 4 && (
        <div className="text-center">
          <span className="text-xs text-sage-500 handwritten">
            +{moments.length - 4} más...
          </span>
        </div>
      )}
    </div>
  </div>
));

// Componente memoizado para cada momento en la timeline horizontal
const HorizontalMomentItem = memo(({ moment, onClick }: {
  moment: Moment;
  onClick: () => void;
}) => {
  const formattedDate = useMemo(() => 
    format(moment.date, "d MMM", { locale: es }),
    [moment.date]
  );

  return (
    <Card 
      className="bg-card paper-texture gentle-shadow hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02] border-sage-200/50 group w-full"
      onClick={onClick}
    >
      <div className="p-3">
        <div className="flex items-start gap-2">
          {moment.photo ? (
            <LazyImage 
              src={moment.photo} 
              alt={moment.title}
              className="w-8 h-8 rounded-md flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-md bg-sage-100 flex items-center justify-center flex-shrink-0">
              <Image className="w-3 h-3 text-sage-400" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h4 className="font-serif-elegant text-sm text-sage-800 leading-snug line-clamp-1 mb-1">
              {moment.title}
            </h4>
            <p className="text-sage-600 text-xs line-clamp-2 whitespace-pre-wrap mb-1">
              {moment.note}
            </p>
            <time className="text-xs text-sage-500 handwritten">
              {formattedDate}
            </time>
          </div>
        </div>
      </div>
    </Card>
  );
});

YearSection.displayName = 'YearSection';
HorizontalMomentItem.displayName = 'HorizontalMomentItem';
HorizontalTimeline.displayName = 'HorizontalTimeline';

export default HorizontalTimeline;
