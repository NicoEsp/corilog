
import { useState } from 'react';
import Header from '@/components/Header';
import MomentCard from '@/components/MomentCard';
import AddMomentForm from '@/components/AddMomentForm';
import MomentDetail from '@/components/MomentDetail';
import Timeline from '@/components/Timeline';
import HorizontalTimeline from '@/components/HorizontalTimeline';
import LoadMoreMoments from '@/components/LoadMoreMoments';
import { Button } from '@/components/ui/button';
import { Camera, BookOpen, Calendar, List, Mail, Book, Lock } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'list' | 'timeline' | 'horizontal-timeline'>('list');

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
      
      <main className="container mx-auto px-4 py-6 sm:py-8">
        {moments.length === 0 && !isLoading ? (
          <div className="text-center py-12 sm:py-20">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-6 sm:mb-8 animate-gentle-bounce">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-sage-400" />
            </div>
            
            <h2 className="text-xl sm:text-2xl font-serif-elegant text-sage-800 mb-3 sm:mb-4 px-4">
              Tu diario está esperando
            </h2>
            
            <p className="text-sage-600 mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed px-4 text-sm sm:text-base">
              Comienza a registrar esos momentos especiales que quieres atesorar para siempre.
            </p>
            
            <Button 
              onClick={() => setShowAddForm(true)}
              disabled={isCreating}
              className="bg-rose-400 hover:bg-rose-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 h-11 px-6 text-base touch-manipulation"
              size="lg"
            >
              <Camera className="w-5 h-5 mr-2" />
              {isCreating ? 'Creando...' : 'Crear mi primer momento'}
            </Button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* Header de momentos con toggle de vista */}
            <div className="mb-6 sm:mb-8 text-center">
              <h2 className="text-xl sm:text-2xl font-serif-elegant text-sage-800 mb-2">
                Momentos atesorados
              </h2>
              <p className="text-sage-600 handwritten text-sm sm:text-base mb-4">
                {moments.length} {moments.length === 1 ? 'momento' : 'momentos'} registrados
              </p>
              
              {/* Toggle entre vistas - ahora con 4 opciones */}
              <div className="flex justify-center gap-2 flex-wrap">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-rose-400 hover:bg-rose-500' : 'border-sage-200 text-sage-600 hover:bg-sage-50'}
                >
                  <List className="w-4 h-4 mr-2" />
                  Lista
                </Button>
                <Button
                  variant={viewMode === 'timeline' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('timeline')}
                  className={viewMode === 'timeline' ? 'bg-rose-400 hover:bg-rose-500' : 'border-sage-200 text-sage-600 hover:bg-sage-50'}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Línea de tiempo
                </Button>
                <Button
                  variant={viewMode === 'horizontal-timeline' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('horizontal-timeline')}
                  className={viewMode === 'horizontal-timeline' ? 'bg-rose-400 hover:bg-rose-500' : 'border-sage-200 text-sage-600 hover:bg-sage-50'}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Timeline H
                </Button>
                
                {/* Funciones premium bloqueadas */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePremiumFeatureClick('Carta al Futuro')}
                  className="border-sage-200 text-sage-400 bg-sage-50 cursor-not-allowed opacity-60"
                  disabled
                >
                  <Lock className="w-3 h-3 mr-1" />
                  <Mail className="w-4 h-4 mr-2" />
                  Carta al Futuro
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePremiumFeatureClick('Exportar a E-book')}
                  className="border-sage-200 text-sage-400 bg-sage-50 cursor-not-allowed opacity-60"
                  disabled
                >
                  <Lock className="w-3 h-3 mr-1" />
                  <Book className="w-4 h-4 mr-2" />
                  E-book
                </Button>
              </div>
            </div>
            
            {/* Vista de lista */}
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
                
                {/* Componente de cargar más */}
                <LoadMoreMoments
                  hasNextPage={hasNextPage}
                  isLoadingMore={isLoadingMore}
                  onLoadMore={handleLoadMore}
                  autoLoad={true}
                />
              </div>
            )}

            {/* Vista de línea de tiempo vertical */}
            {viewMode === 'timeline' && (
              <div className="max-w-2xl mx-auto">
                <Timeline 
                  moments={moments}
                  onMomentClick={setSelectedMoment}
                />
                
                {/* Cargar más en timeline también */}
                <LoadMoreMoments
                  hasNextPage={hasNextPage}
                  isLoadingMore={isLoadingMore}
                  onLoadMore={handleLoadMore}
                  autoLoad={true}
                />
              </div>
            )}

            {/* Vista de línea de tiempo horizontal */}
            {viewMode === 'horizontal-timeline' && (
              <>
                <HorizontalTimeline 
                  moments={moments}
                  onMomentClick={setSelectedMoment}
                />
                
                {/* Cargar más en timeline horizontal también */}
                <div className="mt-8">
                  <LoadMoreMoments
                    hasNextPage={hasNextPage}
                    isLoadingMore={isLoadingMore}
                    onLoadMore={handleLoadMore}
                    autoLoad={true}
                  />
                </div>
              </>
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
