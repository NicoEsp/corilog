
import React, { memo, useMemo } from 'react';
import { Moment } from '@/types/moment';
import TimelineYearSection from './timeline/TimelineYearSection';

interface TimelineProps {
  moments: Moment[];
  onMomentClick: (moment: Moment) => void;
}

const Timeline = memo(({ moments, onMomentClick }: TimelineProps) => {
  // Memoizar el agrupamiento por año y mes con shallow comparison
  const momentsByYearAndMonth = useMemo(() => {
    const groupedData = {} as Record<string, Record<string, Moment[]>>;
    
    moments.forEach((moment) => {
      const year = moment.date.getFullYear();
      const month = moment.date.getMonth();
      const yearKey = year.toString();
      const monthKey = `${year}-${month}`;
      
      if (!groupedData[yearKey]) {
        groupedData[yearKey] = {};
      }
      if (!groupedData[yearKey][monthKey]) {
        groupedData[yearKey][monthKey] = [];
      }
      groupedData[yearKey][monthKey].push(moment);
    });
    
    return groupedData;
  }, [moments]);

  // Memoizar los años ordenados
  const sortedYears = useMemo(() => 
    Object.keys(momentsByYearAndMonth)
      .map(Number)
      .sort((a, b) => b - a),
    [momentsByYearAndMonth]
  );

  // Early return para caso vacío
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
      {sortedYears.map((year) => (
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
