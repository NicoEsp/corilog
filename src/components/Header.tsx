
import { Camera, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onAddMoment: () => void;
}

const Header = ({ onAddMoment }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-sage-200/50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif-elegant text-sage-800 mb-1">
            Corinalog
          </h1>
          <p className="text-sm text-sage-600 handwritten">
            Momentos que atesoro
          </p>
        </div>
        
        <Button 
          onClick={onAddMoment}
          className="bg-rose-400 hover:bg-rose-500 text-white shadow-sm transition-all duration-200 hover:scale-105"
          size="sm"
        >
          <Camera className="w-4 h-4 mr-2" />
          Nuevo momento
        </Button>
      </div>
    </header>
  );
};

export default Header;
