import React from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import MomentCard from './MomentCard';
import { Moment } from '@/types/moment';

interface VirtualizedMomentListProps {
  moments: Moment[];
  onSelect: (moment: Moment) => void;
  onDelete: (id: string) => void;
  onToggleFeatured: (id: string, isFeatured: boolean) => void;
}

const ITEM_HEIGHT = 220;

export default function VirtualizedMomentList({
  moments,
  onSelect,
  onDelete,
  onToggleFeatured,
}: VirtualizedMomentListProps) {
  const rowVirtualizer = useWindowVirtualizer({
    count: moments.length,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 5,
  });

  return (
    <div
      style={{
        height: rowVirtualizer.getTotalSize(),
        width: '100%',
        position: 'relative',
      }}
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
            className="pb-4 sm:pb-6"
          >
            <MomentCard
              moment={moment}
              onClick={() => onSelect(moment)}
              onDelete={onDelete}
              onToggleFeatured={onToggleFeatured}
            />
          </div>
        );
      })}
    </div>
  );
}
