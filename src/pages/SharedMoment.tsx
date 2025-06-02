
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Image, Heart, UserPlus } from 'lucide-react';
import { ShareService } from '@/services/shareService';
import { Moment } from '@/types/moment';

const SharedMoment = () => {
  const { token } = useParams<{ token: string }>();
  const [moment, setMoment] = useState<Moment | null>(null);
  const [sharedBy, setSharedBy] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (token) {
      loadSharedMoment(token);
    }
  }, [token]);

  const loadSharedMoment = async (shareToken: string) => {
    setLoading(true);
    const result = await ShareService.getSharedMoment(shareToken);
    
    if (result) {
      setMoment(result.moment);
      setSharedBy(result.sharedBy);
    } else {
      setError(true);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600 mx-auto mb-4"></div>
          <p className="text-sage-600 handwritten">Cargando momento compartido...</p>
        </div>
      </div>
    );
  }

  if (error || !moment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6 text-sage-400" />
          </div>
          <h1 className="text-xl font-serif-elegant text-sage-800 mb-2">
            Momento no encontrado
          </h1>
          <p className="text-sage-600 mb-6">
            Este enlace puede haber expirado o no ser válido.
          </p>
          <Link to="/auth">
            <Button className="bg-rose-400 hover:bg-rose-500 text-white">
              Crear mi cuenta
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-2xl">
        {/* Header con info de compartido */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 text-sage-500 text-sm mb-4">
            <Heart className="w-4 h-4" />
            <span>Momento compartido por {sharedBy}</span>
          </div>
        </div>

        {/* Momento */}
        <Card className="bg-card paper-texture gentle-shadow border-sage-200/50 animate-fade-in mb-6">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <time className="text-sm text-sage-500 handwritten block mb-3 sm:mb-4">
                {format(moment.date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
              </time>
              
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif-elegant text-sage-800 leading-relaxed px-2">
                {moment.title}
              </h1>
            </div>

            {moment.photo && (
              <div className="mb-6 sm:mb-8">
                <div className="rounded-xl overflow-hidden gentle-shadow">
                  <img 
                    src={moment.photo} 
                    alt={moment.title}
                    className="w-full h-auto max-h-64 sm:max-h-96 object-cover"
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

        {/* Call to action */}
        <Card className="bg-gradient-to-br from-rose-50 to-cream-50 border-rose-200/50 text-center">
          <div className="p-6 sm:p-8">
            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-6 h-6 text-rose-500" />
            </div>
            <h2 className="text-lg font-serif-elegant text-sage-800 mb-2">
              ¿Te gustó este momento?
            </h2>
            <p className="text-sage-600 mb-6 text-sm">
              Crea tu propia cuenta y comienza a guardar tus momentos especiales
            </p>
            <Link to="/auth">
              <Button className="bg-rose-400 hover:bg-rose-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                <Heart className="w-4 h-4 mr-2" />
                Crear mi cuenta
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SharedMoment;
