
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Image } from 'lucide-react';

interface Moment {
  id: string;
  title: string;
  note: string;
  date: Date;
  photo?: string;
}

interface MomentDetailProps {
  moment: Moment;
  onBack: () => void;
}

const MomentDetail = ({ moment, onBack }: MomentDetailProps) => {
  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="min-h-screen">
        <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-sage-200/50 z-10">
          <div className="container mx-auto px-4 py-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-sage-600 hover:text-sage-800 hover:bg-sage-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="bg-card paper-texture gentle-shadow border-sage-200/50 animate-fade-in">
            <div className="p-8">
              <div className="text-center mb-8">
                <time className="text-sm text-sage-500 handwritten block mb-4">
                  {format(moment.date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                </time>
                
                <h1 className="text-3xl font-serif-elegant text-sage-800 leading-relaxed">
                  {moment.title}
                </h1>
              </div>

              {moment.photo && (
                <div className="mb-8">
                  <div className="rounded-xl overflow-hidden gentle-shadow">
                    <img 
                      src={moment.photo} 
                      alt={moment.title}
                      className="w-full h-auto max-h-96 object-cover"
                    />
                  </div>
                </div>
              )}

              {moment.note && (
                <div className="prose prose-sage max-w-none">
                  <div className="bg-cream-50 rounded-xl p-6 border border-sage-200/30">
                    <p className="text-sage-700 leading-relaxed whitespace-pre-wrap font-sans-warm">
                      {moment.note}
                    </p>
                  </div>
                </div>
              )}

              {!moment.note && !moment.photo && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-4">
                    <Image className="w-6 h-6 text-sage-400" />
                  </div>
                  <p className="text-sage-500 handwritten">
                    Un momento para recordar
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MomentDetail;
