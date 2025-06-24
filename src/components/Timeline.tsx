
import React, { memo, useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Moment } from '@/types/moment';
import { Card } from '@/components/ui/card';
import { Image } from 'lucide-react';
import LazyImage from './LazyImage';

interface TimelineProps {
  moments: Moment[];
  onMomentClick: (moment: Moment) => void;
}

const Timeline = memo(({ moments, onMomentClick }: TimelineProps) => {
  // Memoizar el agrupamiento por año y mes para evitar recálculos
  const momentsByYearAndMonth = useMemo(() => {
    return moments.reduce((acc, moment) => {
      const year = moment.date.getFullYear();
      const month = moment.date.getMonth();
      const yearKey = year.toString();
      const monthKey = `${year}-${month}`;
      
      if (!acc[yearKey]) {
        acc[yearKey] = {};
      }
      if (!acc[yearKey][monthKey]) {
        acc[yearKey][monthKey] = [];
      }
      acc[yearKey][monthKey].push(moment);
      return acc;
    }, {} as Record<string, Record<string, Moment[]>>);
  }, [moments]);

  const years = useMemo(() => 
    Object.keys(momentsByYearAndMonth)
      .map(Number)
      .sort((a, b) => b - a),
    [momentsByYearAndMonth]
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
    <div className="space-y-8">
      {years.map((year) => (
        <YearSection 
          key={year} 
          year={year} 
          monthsData={momentsByYearAndMonth[year.toString()]} 
          onMomentClick={onMomentClick}
        />
      ))}
    </div>
  );
});

// Componente memoizado para cada sección de año
const YearSection = memo(({ year, monthsData, onMomentClick }: {
  year: number;
  monthsData: Record<string, Moment[]>;
  onMomentClick: (moment: Moment) => void;
}) => {
  const monthKeys = useMemo(() => 
    Object.keys(monthsData).sort((a, b) => {
      const [yearA, monthA] = a.split('-').map(Number);
      const [yearB, monthB] = b.split('-').map(Number);
      return monthB - monthA; // Orden descendente por mes
    }),
    [monthsData]
  );

  return (
    <div className="relative">
      {/* Año */}
      <div className="sticky top-20 z-10 mb-6">
        <div className="bg-background/95 backdrop-blur-sm inline-block px-4 py-2 rounded-full border border-sage-200/50 shadow-sm">
          <h3 className="font-serif-elegant text-lg text-sage-800">{year}</h3>
        </div>
      </div>

      {/* Línea vertical */}
      <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gradient-to-b from-sage-300 to-transparent"></div>

      {/* Momentos agrupados por mes */}
      <div className="space-y-8 pl-16">
        {monthKeys.map((monthKey) => {
          const moments = monthsData[monthKey];
          const firstMoment = moments[0];
          const monthName = format(firstMoment.date, 'MMM', { locale: es }).toUpperCase();
          
          return (
            <MonthSection
              key={monthKey}
              monthName={monthName}
              moments={moments}
              onMomentClick={onMomentClick}
            />
          );
        })}
      </div>
    </div>
  );
});

// Componente para cada sección de mes
const MonthSection = memo(({ monthName, moments, onMomentClick }: {
  monthName: string;
  moments: Moment[];
  onMomentClick: (moment: Moment) => void;
}) => (
  <div className="relative">
    {/* Tag del mes en el lado derecho */}
    <div className="absolute -right-16 top-2 z-10">
      <div className="bg-sage-100/80 text-sage-600 px-2 py-1 rounded-md text-xs font-medium border border-sage-200/50 shadow-sm">
        <div className="text-center">
          {monthName}
        </div>
        <div className="text-center text-[10px] mt-0.5 text-sage-500">
          {moments.length}
        </div>
      </div>
    </div>

    {/* Momentos del mes */}
    <div className="space-y-4">
      {moments.map((moment) => (
        <MomentTimelineItem 
          key={moment.id} 
          moment={moment} 
          onClick={() => onMomentClick(moment)}
        />
      ))}
    </div>
  </div>
));

// Componente memoizado para cada momento en la timeline
const MomentTimelineItem = memo(({ moment, onClick }: {
  moment: Moment;
  onClick: () => void;
}) => {
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

YearSection.displayName = 'YearSection';
MonthSection.displayName = 'MonthSection';
MomentTimelineItem.displayName = 'MomentTimelineItem';
Timeline.displayName = 'Timeline';

export default Timeline;
