import { useState, useEffect, useCallback, memo, Suspense, lazy } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import MomentCard from '@/components/MomentCard';
import AddMomentForm from '@/components/AddMomentForm';
import MomentDetail from '@/components/MomentDetail';
import { MomentsPagination } from '@/components/MomentsPagination';
import MomentsHeader from '@/components/MomentsHeader';
import StreakRewardModal from '@/components/StreakRewardModal';
import DiarioSkeleton from '@/components/optimized/DiarioSkeleton';
import EmptyState from '@/components/EmptyState';
import { usePaginatedMomentsQuery } from '@/hooks/usePaginatedMomentsQuery';
import { useStreak } from '@/hooks/useStreak';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
// Removed useOptimizedQueries to reduce overhead
// Removed MobileOptimizations to reduce overhead

// Lazy load Timeline para mejorar performance inicial
const Timeline = lazy(() => import('@/components/Timeline'));

const Diario = memo(() => {
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Removed optimization hooks to reduce overhead
  
  const {
    moments,
    isLoading,
    currentPage,
    totalPages,
    totalCount,
    goToPage,
    createMoment,
    deleteMoment,
    toggleFeatured,
    isCreating,
  } = usePaginatedMomentsQuery();
  
  const {
    showWeeklyReward,
    setShowWeeklyReward,
    weeklyReward
  } = useStreak();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMoment, setSelectedMoment] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');

  // Check if we should show add form from navigation state
  useEffect(() => {
    if (location.state?.showAddForm) {
      setShowAddForm(true);
      // Clear the state to prevent reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Memoizar callbacks para evitar re-renders
  const handleAddMoment = useCallback(async (newMoment: any) => {
    console.log('🎯 Creando nuevo momento desde Diario');
    createMoment(newMoment);
    setShowAddForm(false);
  }, [createMoment]);

  const handleDeleteMoment = useCallback(async (momentId: string) => {
    deleteMoment(momentId);
  }, [deleteMoment]);

  const handleToggleFeatured = useCallback(async (momentId: string, isFeatured: boolean) => {
    toggleFeatured(momentId, isFeatured);
  }, [toggleFeatured]);


  const handlePremiumFeatureClick = useCallback((featureName: string) => {
    const premiumMessages: Record<string, string> = {
      'Carta al Futuro': '"Carta al Futuro" es una función premium que estará disponible próximamente.',
      'Exportar a E-book': '"Exportar a E-book" es una función premium que estará disponible próximamente.'
    };

    toast({
      title: "Función Premium",
      description: premiumMessages[featureName] || `"${featureName}" es una función premium que estará disponible próximamente.`,
      variant: "default"
    });
  }, [toast]);

  const handleShowAddForm = useCallback(() => setShowAddForm(true), []);
  const handleHideAddForm = useCallback(() => setShowAddForm(false), []);

  if (isLoading) {
    return <DiarioSkeleton />;
  }

  if (selectedMoment) {
    return (
      <MomentDetail 
        moment={selectedMoment} 
        onBack={() => setSelectedMoment(null)}
        onDelete={handleDeleteMoment}
        onToggleFeatured={handleToggleFeatured}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onAddMoment={() => setShowAddForm(true)} />
      
      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-safe">
        <div className="max-w-4xl mx-auto">
          {(totalCount === 0 && !isCreating) ? (
            <EmptyState 
              onAddMoment={handleShowAddForm}
              isCreating={isCreating}
            />
          ) : (
            <>
              <MomentsHeader
                momentsCount={totalCount}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onPremiumFeatureClick={handlePremiumFeatureClick}
              />

              {viewMode === 'list' ? (
                <div className="space-y-4">
                  {moments.map((moment) => (
                    <MomentCard
                      key={moment.id}
                      moment={moment}
                      onClick={() => setSelectedMoment(moment)}
                      onDelete={handleDeleteMoment}
                      onToggleFeatured={handleToggleFeatured}
                    />
                  ))}
                </div>
              ) : (
                <Suspense fallback={<div className="animate-pulse h-96 bg-muted rounded-lg" />}>
                  <Timeline
                    moments={moments}
                    onMomentClick={setSelectedMoment}
                  />
                </Suspense>
              )}

              <MomentsPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                onPageChange={goToPage}
              />
            </>
          )}
        </div>
      </main>

      {showAddForm && (
        <AddMomentForm
          onSave={handleAddMoment}
          onCancel={() => setShowAddForm(false)}
          isCreating={isCreating}
        />
      )}

      {showWeeklyReward && (
        <StreakRewardModal
          isOpen={showWeeklyReward}
          onClose={() => setShowWeeklyReward(false)}
          streakDays={weeklyReward?.streak_days || 7}
        />
      )}
    </div>
  );
});

Diario.displayName = 'Diario';
export default Diario;