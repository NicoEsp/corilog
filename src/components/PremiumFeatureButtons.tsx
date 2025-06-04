
import { Button } from '@/components/ui/button';
import { Lock, Mail, Book } from 'lucide-react';

interface PremiumFeatureButtonsProps {
  onPremiumFeatureClick: (featureName: string) => void;
}

const PremiumFeatureButtons = ({ onPremiumFeatureClick }: PremiumFeatureButtonsProps) => {
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPremiumFeatureClick('Carta al Futuro')}
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
        onClick={() => onPremiumFeatureClick('Exportar a E-book')}
        className="border-sage-200 text-sage-400 bg-sage-50 cursor-not-allowed opacity-60"
        disabled
      >
        <Lock className="w-3 h-3 mr-1" />
        <Book className="w-4 h-4 mr-2" />
        E-book
      </Button>
    </>
  );
};

export default PremiumFeatureButtons;
