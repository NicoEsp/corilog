
import React, { memo } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { Moment } from '@/types/moment';
import TimelineMomentItem from './TimelineMomentItem';

interface TimelineMonthSectionProps {
  monthName: string;
  moments: Moment[];
  onMomentClick: (moment: Moment) => void;
}

const TimelineMonthSection = memo(({ monthName, moments, onMomentClick }: TimelineMonthSectionProps) => {
  const rowVirtualizer = useWindowVirtualizer({
    count: moments.length,
    estimateSize: () => 140,
    overscan: 5,
  });

  return (
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
      <div
        style={{
          height: rowVirtualizer.getTotalSize(),
          position: 'relative',
        }}
        className="space-y-4"
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const moment = moments[virtualRow.index];
          return (
            <div
              key={moment.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <TimelineMomentItem
                moment={moment}
                onClick={() => onMomentClick(moment)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});

TimelineMonthSection.displayName = 'TimelineMonthSection';

export default TimelineMonthSection;
