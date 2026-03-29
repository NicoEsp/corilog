import { useState, useEffect, useCallback, memo, Suspense, lazy, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import MomentCard from '@/components/MomentCard';
import AddMomentForm from '@/components/AddMomentForm';
import MomentDetail from '@/components/MomentDetail';
import MomentsHeader from '@/components/MomentsHeader';
import StreakRewardModal from '@/components/StreakRewardModal';
import DiarioSkeleton from '@/components/optimized/DiarioSkeleton';
import EmptyState from '@/components/EmptyState';
import FAB from '@/components/FAB';
import BottomNav from '@/components/BottomNav';
import { useInfiniteMomentsQuery } from '@/hooks/useInfiniteMomentsQuery';
import { useStreak } from '@/hooks/useStreak';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

// Lazy load Timeline para mejorar performance inicial
const Timeline = lazy(() => import('@/components/Timeline'));

const Diario = memo(() => {
  const location = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const {
    moments,
    isLoading,
    isLoadingMore,
    hasNextPage,
    fetchNextPage,
    createMoment,
    deleteMoment,
    toggleFeatured,
    isCreating,
  } = useInfiniteMomentsQuery();

  const {
    showWeeklyReward,
    setShowWeeklyReward,
    weeklyReward
  } = useStreak();

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMoment, setSelectedMoment] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');
  const [detailVisible, setDetailVisible] = useState(false);

  // Check if we should show add form from navigation state
  useEffect(() => {
    if (location.state?.showAddForm) {
      setShowAddForm(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Sync MomentDetail slide-up animation with selectedMoment
  useEffect(() => {
    if (selectedMoment) {
      requestAnimationFrame(() => setDetailVisible(true));
    } else {
      setDetailVisible(false);
    }
  }, [selectedMoment]);

  // Infinite scroll sentinel (mobile only)
  useEffect(() => {
    if (!isMobile || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isLoadingMore) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [isMobile, hasNextPage, isLoadingMore, fetchNextPage]);

  const handleAddMoment = useCallback((newMoment: any) => {
    createMoment(newMoment);
    setShowAddForm(false);
  }, [createMoment]);

  const handleDeleteMoment = useCallback((momentId: string) => {
    deleteMoment(momentId);
  }, [deleteMoment]);

  const handleToggleFeatured = useCallback((momentId: string, isFeatured: boolean) => {
    toggleFeatured({ momentId, isFeatured });
  }, [toggleFeatured]);

  const handleSelectMoment = useCallback((moment: any) => {
    setSelectedMoment(moment);
  }, []);

  const handleBackFromDetail = useCallback(() => {
    setDetailVisible(false);
    // Wait for slide-out transition before clearing moment
    setTimeout(() => setSelectedMoment(null), 300);
  }, []);

  const handlePremiumFeatureClick = useCallback((featureName: string) => {
    const premiumMessages: Record<string, string> = {
      'Carta al Futuro': '"Carta al Futuro" es una función premium que estará disponible próximamente.',
      'Exportar a E-book': '"Exportar a E-book" es una función premium que estará disponible próximamente.'
    };
    toast({
      title: "Función Premium",
      description: premiumMessages[featureName] || `"${featureName}" es una función premium que estará disponible próximamente.`,
    });
  }, [toast]);

  const handleShowAddForm = useCallback(() => setShowAddForm(true), []);

  if (isLoading) {
    return <DiarioSkeleton />;
  }

  const totalCount = moments.length;

  return (
    <div className="min-h-screen bg-background">
      <Header onAddMoment={handleShowAddForm} />

      {/* Extra bottom padding on mobile to clear BottomNav + FAB */}
      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-28 md:pb-safe">
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
                      onClick={() => handleSelectMoment(moment)}
                      onDelete={handleDeleteMoment}
                      onToggleFeatured={handleToggleFeatured}
                    />
                  ))}

                  {/* Mobile: IntersectionObserver sentinel for auto-load */}
                  {isMobile && (
                    <div ref={sentinelRef} className="flex justify-center py-4 min-h-[1px]">
                      {isLoadingMore && (
                        <Loader2 className="w-5 h-5 animate-spin text-sage-400" />
                      )}
                    </div>
                  )}

                  {/* Desktop: manual "Load more" button */}
                  {!isMobile && hasNextPage && (
                    <div className="flex justify-center pt-6">
                      <button
                        onClick={() => fetchNextPage()}
                        disabled={isLoadingMore}
                        className="px-6 py-2 text-sm border border-sage-200 rounded-lg text-sage-600 hover:bg-sage-50 transition-colors disabled:opacity-50 touch-manipulation"
                      >
                        {isLoadingMore ? 'Cargando...' : 'Cargar más momentos'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Suspense fallback={<div className="animate-pulse h-96 bg-muted rounded-lg" />}>
                  <Timeline
                    moments={moments}
                    onMomentClick={handleSelectMoment}
                  />
                </Suspense>
              )}
            </>
          )}
        </div>
      </main>

      {/* FAB — mobile only, positioned above BottomNav */}
      <FAB onClick={handleShowAddForm} />

      {/* Bottom Navigation — mobile only */}
      <BottomNav />

      {showAddForm && (
        <AddMomentForm
          onSave={handleAddMoment}
          onCancel={() => setShowAddForm(false)}
          isCreating={isCreating}
        />
      )}

      {/* MomentDetail with slide-up transition on mobile, instant on desktop */}
      {selectedMoment && (
        <div
          className={`fixed inset-0 z-50 bg-background transform transition-transform duration-300 ease-out ${
            detailVisible ? 'translate-y-0' : 'translate-y-full'
          } md:translate-y-0`}
        >
          <MomentDetail
            moment={selectedMoment}
            onBack={handleBackFromDetail}
            onDelete={handleDeleteMoment}
            onToggleFeatured={handleToggleFeatured}
          />
        </div>
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
