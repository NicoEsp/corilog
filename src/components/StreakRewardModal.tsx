import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X, Sparkles } from 'lucide-react';
import StreakImageGenerator from './StreakImageGenerator';

interface StreakRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakDays: number;
  userDisplayName?: string;
}

const StreakRewardModal = ({ isOpen, onClose, streakDays, userDisplayName }: StreakRewardModalProps) => {
  const [imageGenerated, setImageGenerated] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleImageGenerated = (url: string) => {
    setImageUrl(url);
    setImageGenerated(true);
  };

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `corilog-racha-${streakDays}-dias.png`;
      link.click();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-rose-50 to-amber-50 border-rose-200">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-rose-500 to-amber-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          
          <DialogTitle className="text-2xl font-semibold text-gray-800">
            ¡Felicitaciones!
          </DialogTitle>
          
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-700">
              Has alcanzado {streakDays} días consecutivos
            </p>
            <p className="text-sm text-gray-600">
              Tu constancia emocional es admirable. ¡Sigue así!
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image Generator */}
          <div className="bg-white rounded-lg p-4 border border-rose-200">
            <StreakImageGenerator
              streakDays={streakDays}
              userDisplayName={userDisplayName}
              onImageGenerated={handleImageGenerated}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {imageGenerated && (
              <Button
                onClick={handleDownload}
                className="flex-1 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar imagen
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={onClose}
              className={`${imageGenerated ? 'flex-none' : 'flex-1'} border-rose-300 text-rose-700 hover:bg-rose-50`}
            >
              <X className="w-4 h-4 mr-2" />
              Cerrar
            </Button>
          </div>

          {/* Social sharing hint */}
          {imageGenerated && (
            <p className="text-xs text-center text-gray-500">
              Comparte tu logro en redes sociales y motiva a otros a mantener su constancia emocional
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StreakRewardModal;