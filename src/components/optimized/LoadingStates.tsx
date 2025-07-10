import React, { memo } from 'react';
import { Skeleton, MomentCardSkeleton, TimelineSkeleton, HeaderSkeleton } from '@/components/ui/skeleton-loader';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  message?: string;
}

export const LoadingSpinner = memo(({ 
  size = 'md', 
  className,
  message = 'Cargando...' 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {message && (
        <p className="text-sm text-muted-foreground handwritten">{message}</p>
      )}
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export const LoadingOverlay = memo(({ 
  isLoading, 
  children, 
  fallback,
  className 
}: LoadingOverlayProps) => {
  if (isLoading) {
    return (
      <div className={cn('relative', className)}>
        {fallback || <LoadingSpinner className="py-8" />}
      </div>
    );
  }

  return <>{children}</>;
});

LoadingOverlay.displayName = 'LoadingOverlay';

// Componentes específicos de la aplicación
export const MomentsLoading = memo(() => (
  <div className="space-y-6">
    <HeaderSkeleton />
    <TimelineSkeleton />
  </div>
));

MomentsLoading.displayName = 'MomentsLoading';

export const MomentCardLoading = memo(() => <MomentCardSkeleton />);

MomentCardLoading.displayName = 'MomentCardLoading';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState = memo(({ 
  title, 
  description, 
  action, 
  icon,
  className 
}: EmptyStateProps) => (
  <div className={cn('text-center py-12 px-4', className)}>
    {icon && (
      <div className="mb-4 flex justify-center text-muted-foreground">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-serif-elegant text-foreground mb-2">
      {title}
    </h3>
    <p className="text-muted-foreground handwritten mb-6 max-w-md mx-auto">
      {description}
    </p>
    {action}
  </div>
));

EmptyState.displayName = 'EmptyState';