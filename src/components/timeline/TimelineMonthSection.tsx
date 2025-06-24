
import React, { memo } from 'react';
import { Moment } from '@/types/moment';
import TimelineMomentItem from './TimelineMomentItem';

interface TimelineMonthSectionProps {
  monthName: string;
  moments: Moment[];
  onMomentClick: (moment: Moment) => void;
}

const TimelineMonthSection = memo(({ monthName, moments, onMomentClick }: TimelineMonthSectionProps) => (
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
        <TimelineMomentItem 
          key={moment.id} 
          moment={moment} 
          onClick={() => onMomentClick(moment)}
        />
      ))}
    </div>
  </div>
));

TimelineMonthSection.displayName = 'TimelineMonthSection';

export default TimelineMonthSection;
