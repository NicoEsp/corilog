import { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const DiarioSkeleton = memo(() => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-safe">
        <div className="max-w-4xl mx-auto">
          {/* Header with stats skeleton */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <Skeleton className="h-7 w-48 mb-2" />
                <Skeleton className="h-4 w-36" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          </div>

          {/* Moment Cards Skeleton */}
          <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="bg-card rounded-lg border border-border/50 p-4 sm:p-6 space-y-4"
              >
                {/* Card header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>

                {/* Card content */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>

                {/* Card image placeholder */}
                <Skeleton className="h-48 w-full rounded-md" />

                {/* Card actions */}
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
});

DiarioSkeleton.displayName = 'DiarioSkeleton';
export default DiarioSkeleton;