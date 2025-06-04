
import ViewModeToggle from './ViewModeToggle';
import PremiumFeatureButtons from './PremiumFeatureButtons';

interface MomentsHeaderProps {
  momentsCount: number;
  viewMode: 'list' | 'timeline';
  onViewModeChange: (mode: 'list' | 'timeline') => void;
  onPremiumFeatureClick: (featureName: string) => void;
}

const MomentsHeader = ({ 
  momentsCount, 
  viewMode, 
  onViewModeChange, 
  onPremiumFeatureClick 
}: MomentsHeaderProps) => {
  return (
    <div className="mb-6 sm:mb-8 text-center">
      <h2 className="text-xl sm:text-2xl font-serif-elegant text-sage-800 mb-2">
        Momentos atesorados
      </h2>
      <p className="text-sage-600 handwritten text-sm sm:text-base mb-4">
        {momentsCount} {momentsCount === 1 ? 'momento' : 'momentos'} registrados
      </p>
      
      <div className="flex justify-center gap-2 flex-wrap">
        <ViewModeToggle 
          viewMode={viewMode} 
          onViewModeChange={onViewModeChange} 
        />
        <PremiumFeatureButtons 
          onPremiumFeatureClick={onPremiumFeatureClick} 
        />
      </div>
    </div>
  );
};

export default MomentsHeader;
