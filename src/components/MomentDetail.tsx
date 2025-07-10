
import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Image, Trash2, Share } from 'lucide-react';
import DeleteMomentDialog from './DeleteMomentDialog';
import ShareMomentModal from './ShareMomentModal';
import FeaturedButton from './FeaturedButton';

interface Moment {
  id: string;
  title: string;
  note: string;
  date: Date;
  photo?: string;
  is_featured: boolean;
}

interface MomentDetailProps {
  moment: Moment;
  onBack: () => void;
  onDelete: (momentId: string) => void;
  onToggleFeatured?: (momentId: string, isFeatured: boolean) => void;
}

const MomentDetail = ({ moment, onBack, onDelete, onToggleFeatured }: MomentDetailProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleShareClick = () => {
    setShowShareModal(true);
  };

  const handleToggleFeatured = () => {
    if (onToggleFeatured) {
      onToggleFeatured(moment.id, !moment.is_featured);
    }
  };

  const handleConfirmDelete = () => {
    onDelete(moment.id);
    setShowDeleteDialog(false);
    onBack(); // Regresar después de eliminar
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="min-h-screen">
        <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-sage-200/50 z-10">
          <div className="container mx-auto px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-sage-600 hover:text-sage-800 hover:bg-sage-100 h-9 px-3"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Volver</span>
              </Button>

              <div className="flex gap-2">
                {onToggleFeatured && (
                  <FeaturedButton
                    isFeatured={moment.is_featured}
                    onToggle={handleToggleFeatured}
                    className="h-9 px-3"
                    size="default"
                  />
                )}
                <Button
                  variant="ghost"
                  onClick={handleShareClick}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-9 px-3"
                >
                  <Share className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Compartir</span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleDeleteClick}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-9 px-3"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Eliminar</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6 sm:py-8 max-w-2xl">
          <Card className={`bg-card paper-texture gentle-shadow border-sage-200/50 animate-fade-in ${
            moment.is_featured ? 'border-amber-300/50 bg-gradient-to-br from-amber-50/20 to-transparent' : ''
          }`}>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="text-center mb-6 sm:mb-8">
                <time className="text-sm text-sage-500 handwritten block mb-3 sm:mb-4">
                  {format(moment.date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                </time>
                
                <div className="flex items-center justify-center gap-2 mb-3">
                  {moment.is_featured && (
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                  )}
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif-elegant text-sage-800 leading-relaxed px-2">
                    {moment.title}
                  </h1>
                </div>
              </div>

              {moment.photo && (
                <div className="mb-6 sm:mb-8">
                  <div className="rounded-xl overflow-hidden gentle-shadow">
                    <img 
                      src={moment.photo} 
                      alt={moment.title}
                      className="w-full h-auto max-h-64 sm:max-h-96 object-cover select-none"
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  </div>
                </div>
              )}

              {moment.note && (
                <div className="prose prose-sage max-w-none">
                  <div className="bg-cream-50 rounded-xl p-4 sm:p-6 border border-sage-200/30">
                    <p className="text-sage-700 leading-relaxed whitespace-pre-wrap font-sans-warm text-sm sm:text-base">
                      {moment.note}
                    </p>
                  </div>
                </div>
              )}

              {!moment.note && !moment.photo && (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-4">
                    <Image className="w-5 h-5 sm:w-6 sm:h-6 text-sage-400" />
                  </div>
                  <p className="text-sage-500 handwritten text-sm sm:text-base">
                    Un momento para recordar
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <DeleteMomentDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleConfirmDelete}
        momentTitle={moment.title}
      />

      <ShareMomentModal
        moment={moment}
        open={showShareModal}
        onOpenChange={setShowShareModal}
      />
    </div>
  );
};

export default MomentDetail;
