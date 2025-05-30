
import { useState } from 'react';
import Header from '@/components/Header';
import MomentCard from '@/components/MomentCard';
import AddMomentForm from '@/components/AddMomentForm';
import MomentDetail from '@/components/MomentDetail';
import { Button } from '@/components/ui/button';
import { Camera, BookOpen } from 'lucide-react';
import { useMoments } from '@/hooks/useMoments';

const Index = () => {
  const { moments, loading, addMoment, deleteMoment } = useMoments();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMoment, setSelectedMoment] = useState<any>(null);

  const handleAddMoment = async (newMoment: any) => {
    const success = await addMoment(newMoment);
    if (success) {
      setShowAddForm(false);
    }
  };

  const handleDeleteMoment = async (momentId: string) => {
    await deleteMoment(momentId);
  };

  if (loading) {
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
        {moments.length === 0 ? (
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
              className="bg-rose-400 hover:bg-rose-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 h-11 px-6 text-base touch-manipulation"
              size="lg"
            >
              <Camera className="w-5 h-5 mr-2" />
              Crear mi primer momento
            </Button>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6 sm:mb-8 text-center">
              <h2 className="text-xl sm:text-2xl font-serif-elegant text-sage-800 mb-2">
                Momentos atesorados
              </h2>
              <p className="text-sage-600 handwritten text-sm sm:text-base">
                {moments.length} {moments.length === 1 ? 'momento' : 'momentos'} registrados
              </p>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              {moments.map((moment, index) => (
                <div
                  key={moment.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <MomentCard 
                    moment={moment} 
                    onClick={() => setSelectedMoment(moment)}
                    onDelete={handleDeleteMoment}
                  />
                </div>
              ))}
            </div>
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
