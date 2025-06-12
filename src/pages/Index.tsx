
import { useState } from 'react';
import Header from '@/components/Header';
import MomentCard from '@/components/MomentCard';
import AddMomentForm from '@/components/AddMomentForm';
import MomentDetail from '@/components/MomentDetail';
import Timeline from '@/components/Timeline';
import LoadMoreMoments from '@/components/LoadMoreMoments';
import EmptyState from '@/components/EmptyState';
import MomentsHeader from '@/components/MomentsHeader';
import { useInfiniteMomentsQuery } from '@/hooks/useInfiniteMomentsQuery';

const Index = () => {
  const { 
    moments, 
    isLoading, 
    isLoadingMore,
    hasNextPage,
    fetchNextPage,
    createMoment, 
    deleteMoment, 
    isCreating 
  } = useInfiniteMomentsQuery();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMoment, setSelectedMoment] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');

  const handleAddMoment = async (newMoment: any) => {
    createMoment(newMoment);
    setShowAddForm(false);
  };

  const handleDeleteMoment = async (momentId: string) => {
    deleteMoment(momentId);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isLoadingMore) {
      fetchNextPage();
    }
  };

  const handlePremiumFeatureClick = (featureName: string) => {
    alert(`"${featureName}" es una función premium que estará disponible próximamente.`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header onAddMoment={() => setShowAddForm(true)} />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600 mx-auto mb-4"></div>
            <p className="text-sage-600 handwritten">Cargando tus momentos...</p>
          </div>
        </main>
      </div>
    );
  }

  if (selectedMoment) {
    return (
      <MomentDetail 
        moment={selectedMoment} 
        onBack={() => setSelectedMoment(null)}
        onDelete={handleDeleteMoment}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onAddMoment={() => setShowAddForm(true)} />
      
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-safe">
        {moments.length === 0 && !isLoading ? (
          <EmptyState 
            onAddMoment={() => setShowAddForm(true)}
            isCreating={isCreating}
          />
        ) : (
          <div className="max-w-4xl mx-auto">
            <MomentsHeader
              momentsCount={moments.length}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onPremiumFeatureClick={handlePremiumFeatureClick}
            />
            
            {viewMode === 'list' && (
              <div className="space-y-4 sm:space-y-6 max-w-2xl mx-auto">
                {moments.map((moment, index) => (
                  <div
                    key={moment.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${(index % 10) * 0.1}s` }}
                  >
                    <MomentCard 
                      moment={moment} 
                      onClick={() => setSelectedMoment(moment)}
                      onDelete={handleDeleteMoment}
                    />
                  </div>
                ))}
                
                <LoadMoreMoments
                  hasNextPage={hasNextPage}
                  isLoadingMore={isLoadingMore}
                  onLoadMore={handleLoadMore}
                  autoLoad={true}
                />
              </div>
            )}

            {viewMode === 'timeline' && (
              <div className="max-w-2xl mx-auto">
                <Timeline 
                  moments={moments}
                  onMomentClick={setSelectedMoment}
                />
                
                <LoadMoreMoments
                  hasNextPage={hasNextPage}
                  isLoadingMore={isLoadingMore}
                  onLoadMore={handleLoadMore}
                  autoLoad={true}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {showAddForm && (
        <AddMomentForm
          onSave={handleAddMoment}
          onCancel={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
};

export default Index;
