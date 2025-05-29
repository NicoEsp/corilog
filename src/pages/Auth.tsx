
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { BookOpen, Camera, Lock, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const Auth = () => {
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirigir si ya está autenticado
  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: "Error de inicio de sesión",
              description: "Email o contraseña incorrectos",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "¡Bienvenida!",
            description: "Has iniciado sesión correctamente",
          });
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) {
          if (error.message.includes('User already registered')) {
            toast({
              title: "Usuario ya existe",
              description: "Este email ya está registrado. Intenta iniciar sesión.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "¡Cuenta creada!",
            description: "Tu cuenta ha sido creada exitosamente",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error inesperado",
        description: "Ocurrió un error. Intenta nuevamente.",
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-rose-500" />
          </div>
          <h1 className="text-3xl font-serif-elegant text-sage-800 mb-2">
            Corilog
          </h1>
          <p className="text-sage-600 handwritten">
            Momentos que atesoro
          </p>
        </div>

        <Card className="bg-card paper-texture gentle-shadow border-sage-200/50">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-serif-elegant text-sage-800 mb-2">
                {isLogin ? 'Bienvenida de vuelta' : 'Crear cuenta'}
              </h2>
              <p className="text-sm text-sage-600 handwritten">
                {isLogin 
                  ? 'Accede a tus momentos especiales' 
                  : 'Comienza a guardar tus recuerdos'
                }
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-sage-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="pl-10 bg-cream-50 border-sage-200 focus:border-rose-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-sage-400" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 bg-cream-50 border-sage-200 focus:border-rose-300"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                type="submit"
                className="w-full bg-rose-400 hover:bg-rose-500 text-white"
                disabled={isSubmitting || !email || !password}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {isLogin ? 'Iniciando sesión...' : 'Creando cuenta...'}
                  </div>
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
                  </>
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-sage-600 hover:text-sage-800 underline handwritten"
                >
                  {isLogin 
                    ? '¿No tienes cuenta? Crear una' 
                    : '¿Ya tienes cuenta? Iniciar sesión'
                  }
                </button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
