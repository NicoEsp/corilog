import { useState } from 'react';
import Header from '@/components/Header';
import MomentCard from '@/components/MomentCard';
import AddMomentForm from '@/components/AddMomentForm';
import MomentDetail from '@/components/MomentDetail';
import { Button } from '@/components/ui/button';
import { Camera, BookOpen } from 'lucide-react';

interface Moment {
  id: string;
  title: string;
  note: string;
  date: Date;
  photo?: string;
}

const Index = () => {
  const [moments, setMoments] = useState<Moment[]>([
    {
      id: '1',
      title: 'Primera sonrisa',
      note: 'Hoy Corina me regaló su primera sonrisa consciente. Era como si todo el mundo se iluminara de repente. Estaba cambiándole el pañal y de repente sus ojitos se arrugaron y apareció esa sonrisa perfecta que me derritió el corazón.',
      date: new Date('2024-02-15'),
    },
    {
      id: '2',
      title: 'Primer diente',
      note: 'Apareció su primer dientito! Lo descubrí cuando estaba bostezando. Tan pequeñito y perfecto.',
      date: new Date('2024-04-22'),
    },
    {
      id: '3',
      title: 'Primeras risas',
      note: 'Sus primeras carcajadas llegaron mientras jugábamos a "cu-cu tras". El sonido más hermoso del mundo.',
      date: new Date('2024-03-10'),
    }
  ]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null);

  const handleAddMoment = (newMoment: Omit<Moment, 'id'>) => {
    const moment: Moment = {
      id: Date.now().toString(),
      ...newMoment
    };
    setMoments(prev => [moment, ...prev]);
    setShowAddForm(false);
  };

  const sortedMoments = [...moments].sort((a, b) => b.date.getTime() - a.date.getTime());

  if (selectedMoment) {
    return (
      <MomentDetail 
        moment={selectedMoment} 
        onBack={() => setSelectedMoment(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onAddMoment={() => setShowAddForm(true)} />
      
      <main className="container mx-auto px-4 py-8">
        {moments.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-8 animate-gentle-bounce">
              <BookOpen className="w-8 h-8 text-sage-400" />
            </div>
            
            <h2 className="text-2xl font-serif-elegant text-sage-800 mb-4">
              Tu diario está esperando
            </h2>
            
            <p className="text-sage-600 mb-8 max-w-md mx-auto leading-relaxed">
              Comienza a registrar esos momentos especiales que quieres atesorar para siempre.
            </p>
            
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-rose-400 hover:bg-rose-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              size="lg"
            >
              <Camera className="w-5 h-5 mr-2" />
              Crear mi primer momento
            </Button>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-serif-elegant text-sage-800 mb-2">
                Momentos atesorados
              </h2>
              <p className="text-sage-600 handwritten">
                {moments.length} {moments.length === 1 ? 'momento' : 'momentos'} registrados
              </p>
            </div>
            
            <div className="space-y-6">
              {sortedMoments.map((moment, index) => (
                <div
                  key={moment.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <MomentCard 
                    moment={moment} 
                    onClick={() => setSelectedMoment(moment)}
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
