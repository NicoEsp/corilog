
import { Button } from '@/components/ui/button';
import { Lock, Mail, Book, Crown } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';

interface PremiumFeatureButtonsProps {
  onPremiumFeatureClick: (featureName: string) => void;
}

const PremiumFeatureButtons = ({ onPremiumFeatureClick }: PremiumFeatureButtonsProps) => {
  const { role, canAccessFeature, loading } = useUserRole();

  if (loading) {
    return (
      <div className="flex gap-2">
        <div className="h-8 w-24 bg-sage-100 animate-pulse rounded"></div>
        <div className="h-8 w-20 bg-sage-100 animate-pulse rounded"></div>
      </div>
    );
  }

  const handleFeatureClick = (featureName: string) => {
    if (canAccessFeature('future-letter') || canAccessFeature('ebook')) {
      // Usuario premium o superadmin - funcionalidad habilitada
      onPremiumFeatureClick(featureName);
    } else {
      // Usuario free - mostrar mensaje de upgrade
      onPremiumFeatureClick(`Actualiza a Premium para acceder a "${featureName}"`);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleFeatureClick('Carta al Futuro')}
        className={
          canAccessFeature('future-letter')
            ? "border-sage-300 text-sage-700 hover:bg-sage-50"
            : "border-sage-200 text-sage-400 bg-sage-50 cursor-not-allowed opacity-60"
        }
        disabled={!canAccessFeature('future-letter')}
      >
        {!canAccessFeature('future-letter') && <Lock className="w-3 h-3 mr-1" />}
        {role === 'superadmin' && <Crown className="w-3 h-3 mr-1" />}
        <Mail className="w-4 h-4 mr-2" />
        Carta al Futuro
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleFeatureClick('Exportar a E-book')}
        className={
          canAccessFeature('ebook')
            ? "border-sage-300 text-sage-700 hover:bg-sage-50"
            : "border-sage-200 text-sage-400 bg-sage-50 cursor-not-allowed opacity-60"
        }
        disabled={!canAccessFeature('ebook')}
      >
        {!canAccessFeature('ebook') && <Lock className="w-3 h-3 mr-1" />}
        {role === 'superadmin' && <Crown className="w-3 h-3 mr-1" />}
        <Book className="w-4 h-4 mr-2" />
        E-book
      </Button>
    </>
  );
};

export default PremiumFeatureButtons;
