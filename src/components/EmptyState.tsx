
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, BookOpen } from 'lucide-react';

interface EmptyStateProps {
  onAddMoment: () => void;
  isCreating: boolean;
}

const EmptyState = ({ onAddMoment, isCreating }: EmptyStateProps) => {
  return (
    <div className="text-center py-12 sm:py-20">
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-6 sm:mb-8 animate-gentle-bounce">
        <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-sage-400" />
      </div>
      
      <h2 className="text-xl sm:text-2xl font-semibold text-sage-800 mb-3 sm:mb-4 px-4">
        Tu diario está esperando
      </h2>
      
      <p className="text-sage-600 mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed px-4 text-sm sm:text-base font-medium">
        Comienza a registrar esos momentos especiales que quieres atesorar para siempre.
      </p>
      
      <Button 
        onClick={onAddMoment}
        disabled={isCreating}
        className="bg-rose-600 hover:bg-rose-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 h-11 px-6 text-base touch-manipulation"
        size="lg"
      >
        <Camera className="w-5 h-5 mr-2" />
        {isCreating ? 'Creando...' : 'Crear mi primer momento'}
      </Button>
    </div>
  );
};

export default EmptyState;
