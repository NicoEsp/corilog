
import React from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Loader2 } from 'lucide-react';

interface LoadMoreMomentsProps {
  hasNextPage: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  autoLoad?: boolean;
}

const LoadMoreMoments = ({ 
  hasNextPage, 
  isLoadingMore, 
  onLoadMore, 
  autoLoad = true 
}: LoadMoreMomentsProps) => {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 1.0,
    rootMargin: '100px',
  });

  // Auto-cargar cuando el elemento sea visible
  React.useEffect(() => {
    if (autoLoad && isIntersecting && hasNextPage && !isLoadingMore) {
      onLoadMore();
    }
  }, [isIntersecting, hasNextPage, isLoadingMore, onLoadMore, autoLoad]);

  if (!hasNextPage && !isLoadingMore) {
    return (
      <div className="text-center py-8">
        <p className="text-sage-500 handwritten text-sm">
          ✨ Has llegado al final de tus momentos ✨
        </p>
      </div>
    );
  }

  return (
    <div ref={ref} className="py-6">
      {isLoadingMore ? (
        <div className="space-y-4">
          {/* Skeleton loading para momentos */}
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl p-6 border border-sage-200/30">
              <div className="flex items-start gap-4">
                <Skeleton className="w-16 h-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center">
          <Button
            onClick={onLoadMore}
            variant="outline"
            className="border-sage-200 text-sage-600 hover:bg-sage-50"
            disabled={!hasNextPage}
          >
            <Loader2 className="w-4 h-4 mr-2" />
            Cargar más momentos
          </Button>
        </div>
      )}
    </div>
  );
};

export default LoadMoreMoments;
