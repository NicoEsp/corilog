
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

interface FeaturedButtonProps {
  isFeatured: boolean;
  onToggle: () => void;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
}

const FeaturedButton = ({ isFeatured, onToggle, className = "", size = "icon" }: FeaturedButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await onToggle();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleClick}
      disabled={isLoading}
      className={`transition-all duration-200 ${
        isFeatured 
          ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50' 
          : 'text-sage-400 hover:text-amber-600 hover:bg-amber-50'
      } ${className}`}
    >
      <Star 
        className={`w-4 h-4 transition-all duration-200 ${
          isFeatured ? 'fill-current' : ''
        } ${isLoading ? 'animate-pulse' : ''}`} 
      />
    </Button>
  );
};

export default FeaturedButton;
