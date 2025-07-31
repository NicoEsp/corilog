import { useState, useEffect, useCallback, memo, Suspense, lazy } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import VirtualizedMomentList from '@/components/VirtualizedMomentList';
import AddMomentForm from '@/components/AddMomentForm';
import MomentDetail from '@/components/MomentDetail';
import LoadMoreMoments from '@/components/LoadMoreMoments';
import MomentsHeader from '@/components/MomentsHeader';
import StreakRewardModal from '@/components/StreakRewardModal';
import DiarioSkeleton from '@/components/optimized/DiarioSkeleton';
import { useInfiniteMomentsQuery } from '@/hooks/useInfiniteMomentsQuery';
import { useStreak } from '@/hooks/useStreak';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Lazy load Timeline para mejorar performance inicial
const Timeline = lazy(() => import('@/components/Timeline'));

const Diario = memo(() => {
  const location = useLocation();
  const { user } = useAuth();
  const { 
    moments, 
    isLoading, 
    isLoadingMore,
    hasNextPage,
    fetchNextPage,
    createMoment, 
    deleteMoment, 
    toggleFeatured,
    isCreating 
  } = useInfiniteMomentsQuery();
  
  const {
    showWeeklyReward,
    setShowWeeklyReward,
    weeklyReward
  } = useStreak();
  
  const { toast } = useToast();
  
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
    toggleFeatured({ momentId, isFeatured });
  }, [toggleFeatured]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isLoadingMore) {
      fetchNextPage();
    }
  }, [hasNextPage, isLoadingMore, fetchNextPage]);

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
      <Header onAddMoment={handleShowAddForm} />
      
      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-safe">
        <div className="max-w-4xl mx-auto">
          <MomentsHeader
            momentsCount={moments.length}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onPremiumFeatureClick={handlePremiumFeatureClick}
          />
          
          {viewMode === 'list' && (
            <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto">
              <VirtualizedMomentList
                moments={moments}
                onSelect={setSelectedMoment}
                onDelete={handleDeleteMoment}
                onToggleFeatured={handleToggleFeatured}
              />

              <LoadMoreMoments
                hasNextPage={hasNextPage}
                isLoadingMore={isLoadingMore}
                onLoadMore={handleLoadMore}
                autoLoad={true}
              />
            </div>
          )}

          {viewMode === 'timeline' && (
            <div className="max-w-3xl mx-auto">
              <Suspense fallback={
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sage-600"></div>
                </div>
              }>
                <Timeline 
                  moments={moments}
                  onMomentClick={setSelectedMoment}
                />
              </Suspense>
              
              <LoadMoreMoments
                hasNextPage={hasNextPage}
                isLoadingMore={isLoadingMore}
                onLoadMore={handleLoadMore}
                autoLoad={true}
              />
            </div>
          )}
        </div>
      </main>

      {showAddForm && (
        <AddMomentForm
          onSave={handleAddMoment}
          onCancel={handleHideAddForm}
          isCreating={isCreating}
        />
      )}

      {/* Streak Reward Modal */}
      <StreakRewardModal
        isOpen={showWeeklyReward}
        onClose={() => setShowWeeklyReward(false)}
        streakDays={7}
        userDisplayName={user?.email?.split('@')[0] || 'Usuario'}
      />
    </div>
  );
});

Diario.displayName = 'Diario';
export default Diario;