import { useState } from 'react';
import Header from '@/components/Header';
import MomentCard from '@/components/MomentCard';
import AddMomentForm from '@/components/AddMomentForm';
import MomentDetail from '@/components/MomentDetail';
import Timeline from '@/components/Timeline';
import LoadMoreMoments from '@/components/LoadMoreMoments';
import WelcomeScreen from '@/components/WelcomeScreen';
import MomentsHeader from '@/components/MomentsHeader';
import { useInfiniteMomentsQuery } from '@/hooks/useInfiniteMomentsQuery';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
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
  
  const { toast } = useToast();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMoment, setSelectedMoment] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');

  const handleAddMoment = async (newMoment: any) => {
    console.log('🎯 Creando nuevo momento desde Index');
    createMoment(newMoment);
    setShowAddForm(false);
  };

  const handleDeleteMoment = async (momentId: string) => {
    deleteMoment(momentId);
  };

  const handleToggleFeatured = async (momentId: string, isFeatured: boolean) => {
    toggleFeatured({ momentId, isFeatured });
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isLoadingMore) {
      fetchNextPage();
    }
  };

  const handlePremiumFeatureClick = (featureName: string) => {
    const premiumMessages: Record<string, string> = {
      'Carta al Futuro': '"Carta al Futuro" es una función premium que estará disponible próximamente.',
      'Exportar a E-book': '"Exportar a E-book" es una función premium que estará disponible próximamente.'
    };

    toast({
      title: "Función Premium",
      description: premiumMessages[featureName] || `"${featureName}" es una función premium que estará disponible próximamente.`,
      variant: "default"
    });
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
        onToggleFeatured={handleToggleFeatured}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onAddMoment={() => setShowAddForm(true)} />
      
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-safe">
        {moments.length === 0 && !isLoading ? (
          <WelcomeScreen 
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
                      onToggleFeatured={handleToggleFeatured}
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
          isCreating={isCreating}
        />
      )}
    </div>
  );
};

export default Index;
