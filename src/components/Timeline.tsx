
import React, { memo, useMemo } from 'react';
import { Moment } from '@/types/moment';
import TimelineYearSection from './timeline/TimelineYearSection';

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
        <TimelineYearSection 
          key={year} 
          year={year} 
          monthsData={momentsByYearAndMonth[year.toString()]} 
          onMomentClick={onMomentClick}
        />
      ))}
    </div>
  );
});

Timeline.displayName = 'Timeline';

export default Timeline;
