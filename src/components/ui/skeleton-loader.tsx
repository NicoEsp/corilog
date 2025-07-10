import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'circular' | 'rectangular' | 'text';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton = ({
  className,
  variant = 'default',
  width,
  height,
  animation = 'pulse',
  ...props
}: SkeletonProps) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  
  const variantClasses = {
    default: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    text: 'rounded h-4',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
      {...props}
    />
  );
};

// Skeleton preconfigurados para componentes específicos
export const MomentCardSkeleton = () => (
  <div className="bg-card rounded-xl p-4 sm:p-6 border border-sage-200/30 space-y-4">
    <div className="flex items-start gap-4">
      <Skeleton variant="rectangular" width={64} height={64} className="rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <Skeleton variant="text" className="w-3/4 h-5" />
        <Skeleton variant="text" className="w-full h-4" />
        <Skeleton variant="text" className="w-1/2 h-3" />
      </div>
    </div>
  </div>
);

export const TimelineSkeleton = () => (
  <div className="space-y-8">
    {[1, 2, 3].map((i) => (
      <div key={i} className="space-y-6">
        <Skeleton variant="text" className="w-32 h-6" />
        <div className="space-y-4">
          {[1, 2].map((j) => (
            <MomentCardSkeleton key={j} />
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const HeaderSkeleton = () => (
  <div className="flex items-center justify-between p-4">
    <div className="flex items-center gap-3">
      <Skeleton variant="circular" width={40} height={40} />
      <Skeleton variant="text" className="w-32 h-5" />
    </div>
    <div className="flex gap-2">
      <Skeleton variant="rectangular" width={80} height={36} className="rounded-md" />
      <Skeleton variant="rectangular" width={100} height={36} className="rounded-md" />
    </div>
  </div>
);

export const LoadingGrid = ({ count = 6 }: { count?: number }) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }).map((_, i) => (
      <MomentCardSkeleton key={i} />
    ))}
  </div>
);