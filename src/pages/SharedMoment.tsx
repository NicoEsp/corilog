
import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, Heart, User } from 'lucide-react';
import { SharedMomentService } from '@/services/sharedMomentService';
import { SharedMomentAccess } from '@/types/sharedMoment';

const SharedMoment = () => {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const [momentAccess, setMomentAccess] = useState<SharedMomentAccess | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSharedMoment = async () => {
      console.log('=== CARGANDO MOMENTO COMPARTIDO ===');
      console.log('Token:', token);
      console.log('Search params:', Object.fromEntries(searchParams.entries()));
      
      if (!token) {
        console.log('ERROR: Token no válido');
        setError('Token de acceso no válido');
        setLoading(false);
        return;
      }

      const encodedEmail = searchParams.get('email');
      console.log('Email codificado recibido:', encodedEmail);
      
      if (!encodedEmail) {
        console.log('ERROR: Email no encontrado en la URL');
        setError('Email de acceso no válido');
        setLoading(false);
        return;
      }

      try {
        let email: string;
        
        // Intentar decodificar el email como base64
        try {
          email = atob(encodedEmail);
          console.log('Email decodificado (base64):', email);
        } catch (decodeError) {
          // Si falla la decodificación base64, usar el email tal como está
          email = decodeURIComponent(encodedEmail);
          console.log('Email decodificado (URL):', email);
        }
        
        console.log('Email final para validación:', email);
        
        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          console.log('ERROR: Formato de email inválido');
          setError('Formato de email no válido');
          setLoading(false);
          return;
        }
        
        console.log('Llamando a SharedMomentService.getSharedMomentAccess...');
        const access = await SharedMomentService.getSharedMomentAccess(token, email);
        console.log('Respuesta del servicio:', access);
        
        if (access && access.isValid) {
          console.log('Acceso válido, configurando momento');
          setMomentAccess(access);
        } else {
          console.log('Acceso inválido:', access?.error);
          setError(access?.error || 'No se pudo acceder al momento');
        }
      } catch (error) {
        console.error('Error al procesar el momento compartido:', error);
        setError('Error al procesar el enlace de acceso');
      } finally {
        setLoading(false);
      }
    };

    loadSharedMoment();
  }, [token, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-sage-600 handwritten">Cargando momento especial...</p>
        </div>
      </div>
    );
  }

  if (error || !momentAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto text-center p-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-serif-elegant text-sage-800 mb-2">
            Oops, algo salió mal
          </h1>
          <p className="text-sage-600 mb-6">
            {error}
          </p>
          <div className="space-y-2 mb-6">
            <p className="text-xs text-sage-500">
              Debug info:
            </p>
            <p className="text-xs text-sage-400 font-mono">
              Token: {token?.substring(0, 8)}...
            </p>
            <p className="text-xs text-sage-400 font-mono">
              Email param: {new URLSearchParams(window.location.search).get('email')?.substring(0, 10)}...
            </p>
          </div>
          <Link to="/">
            <Button variant="outline" className="border-sage-300 text-sage-600 hover:bg-sage-50">
              Ir a Corilog
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const { moment, sharedBy } = momentAccess;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-sage-200/50 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-sage-800">Corilog</h1>
              <p className="text-xs text-sage-600">Momento compartido</p>
            </div>
            <Link to="/">
              <Button variant="outline" size="sm" className="border-sage-300 text-sage-600 hover:bg-sage-50">
                Crear mi cuenta
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <User className="w-4 h-4 text-sage-500" />
            <span className="text-sm text-sage-600">
              Compartido por <strong>{sharedBy}</strong>
            </span>
          </div>
        </div>

        <Card className="bg-card paper-texture gentle-shadow border-sage-200/50 animate-fade-in">
          <div className="p-6 sm:p-8">
            <div className="text-center mb-8">
              <time className="text-sm text-sage-500 handwritten block mb-4">
                {format(new Date(moment.date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
              </time>
              
              <h1 className="text-2xl sm:text-3xl font-serif-elegant text-sage-800 leading-relaxed">
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
                  <Heart className="w-6 h-6 text-sage-400" />
                </div>
                <p className="text-sage-500 handwritten">
                  Un momento para recordar
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* CTA Section */}
        <div className="mt-8 text-center bg-gradient-to-r from-rose-50 to-purple-50 rounded-xl p-6 border border-rose-200/50">
          <h3 className="font-serif-elegant text-lg text-sage-800 mb-2">
            ¿Te gustó este momento?
          </h3>
          <p className="text-sage-600 text-sm mb-4">
            Crea tu propia colección de recuerdos especiales
          </p>
          <Link to="/auth">
            <Button className="bg-rose-600 hover:bg-rose-700 text-white">
              Crear mi cuenta gratis
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SharedMoment;
