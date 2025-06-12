
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Image, Heart, UserPlus, Copy, Check } from 'lucide-react';
import { ShareService } from '@/services/shareService';
import { Moment } from '@/types/moment';
import { toast } from '@/hooks/use-toast';

const SharedMoment = () => {
  const { token } = useParams<{ token: string }>();
  const [moment, setMoment] = useState<Moment | null>(null);
  const [sharedBy, setSharedBy] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

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

  const shareCurrentPage = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      toast({
        title: "¡Enlace copiado!",
        description: "Ahora puedes compartir este momento con otros",
      });
    } catch (error) {
      console.error('Error copying link:', error);
    }
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
      <div className="container mx-auto px-4 py-4 sm:py-6 max-w-2xl">
        {/* Header mejorado */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="flex items-center justify-center gap-2 text-sage-500 text-sm mb-3">
            <Heart className="w-4 h-4 text-rose-400" />
            <span>Momento compartido por <span className="font-medium text-sage-700">{sharedBy}</span></span>
          </div>
          
          {/* Botón para compartir este momento */}
          <Button
            onClick={shareCurrentPage}
            variant="outline"
            size="sm"
            className="border-sage-200 text-sage-600 hover:bg-sage-50"
          >
            {linkCopied ? (
              <>
                <Check className="w-4 h-4 mr-2 text-green-600" />
                ¡Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Compartir este momento
              </>
            )}
          </Button>
        </div>

        {/* Momento */}
        <Card className="bg-card paper-texture gentle-shadow border-sage-200/50 animate-fade-in mb-4 sm:mb-6">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-4 sm:mb-6">
              <time className="text-sm text-sage-500 handwritten block mb-2 sm:mb-3">
                {format(moment.date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
              </time>
              
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif-elegant text-sage-800 leading-relaxed px-2">
                {moment.title}
              </h1>
            </div>

            {moment.photo && (
              <div className="mb-4 sm:mb-6">
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
              <div className="text-center py-6 sm:py-8">
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

        {/* Call to action mejorado */}
        <Card className="bg-gradient-to-br from-rose-50 to-cream-50 border-rose-200/50 text-center">
          <div className="p-4 sm:p-6">
            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-3">
              <UserPlus className="w-6 h-6 text-rose-500" />
            </div>
            <h2 className="text-lg font-serif-elegant text-sage-800 mb-2">
              ¿Te gustó este momento?
            </h2>
            <p className="text-sage-600 mb-4 text-sm">
              Crea tu propia cuenta en Corilog y comienza a guardar tus momentos especiales
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Link to="/auth">
                <Button className="bg-rose-400 hover:bg-rose-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 w-full sm:w-auto">
                  <Heart className="w-4 h-4 mr-2" />
                  Crear mi cuenta
                </Button>
              </Link>
              <Button
                onClick={shareCurrentPage}
                variant="outline"
                className="border-sage-200 text-sage-600 hover:bg-sage-50 w-full sm:w-auto"
              >
                {linkCopied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-green-600" />
                    ¡Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Compartir momento
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SharedMoment;
