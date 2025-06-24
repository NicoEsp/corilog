
import React, { memo, useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Moment } from '@/types/moment';
import TimelineMonthSection from './TimelineMonthSection';

interface TimelineYearSectionProps {
  year: number;
  monthsData: Record<string, Moment[]>;
  onMomentClick: (moment: Moment) => void;
}

const TimelineYearSection = memo(({ year, monthsData, onMomentClick }: TimelineYearSectionProps) => {
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
            <TimelineMonthSection
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

TimelineYearSection.displayName = 'TimelineYearSection';

export default TimelineYearSection;
