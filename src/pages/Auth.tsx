import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Card } from '@/components/ui/card';
import { BookOpen, Camera, Lock, Mail, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator';
import { validatePassword } from '@/utils/passwordValidation';
import { validateEmail } from '@/utils/inputSanitization';
import { getSecureErrorMessage, logError } from '@/utils/errorHandling';
import { authRateLimiter } from '@/utils/rateLimiting';

const Auth = () => {
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Redirigir si ya está autenticado
  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  const validateForm = (): boolean => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    // Validate email
    if (!email || !validateEmail(email)) {
      setEmailError('Por favor ingresa un email válido');
      isValid = false;
    }

    // Validate password
    if (!password) {
      setPasswordError('La contraseña es requerida');
      isValid = false;
    } else if (!isLogin) {
      // For registration, check password strength
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        setPasswordError('La contraseña no cumple con los requisitos de seguridad');
        isValid = false;
      }
    } else if (password.length < 6) {
      // For login, minimum length check
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      isValid = false;
    }
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Check rate limiting
    const rateLimitKey = `auth_${email}`;
    if (authRateLimiter.isBlocked(rateLimitKey)) {
      const remainingTime = authRateLimiter.getRemainingBlockTime(rateLimitKey);
      toast({
        title: "Demasiados intentos",
        description: `Espera ${remainingTime} minutos antes de intentar nuevamente`,
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password
        });
        
        if (error) {
          // Record failed attempt
          const { blocked } = authRateLimiter.recordAttempt(rateLimitKey);
          logError(error, 'auth_signin');
          
          if (blocked) {
            const remainingTime = authRateLimiter.getRemainingBlockTime(rateLimitKey);
            toast({
              title: "Cuenta temporalmente bloqueada",
              description: `Demasiados intentos fallidos. Espera ${remainingTime} minutos.`,
              variant: "destructive"
            });
          } else {
            toast({
              title: "Error de inicio de sesión",
              description: getSecureErrorMessage(error),
              variant: "destructive"
            });
          }
        } else {
          toast({
            title: "¡Bienvenida de vuelta!",
            description: "Has iniciado sesión correctamente"
          });
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password
        });
        
        if (error) {
          logError(error, 'auth_signup');
          toast({
            title: "Error de registro",
            description: getSecureErrorMessage(error),
            variant: "destructive"
          });
        } else {
          // Successful registration - show confirmation and switch to login
          toast({
            title: "¡Cuenta creada exitosamente!",
            description: "Ahora puedes iniciar sesión con tu email y contraseña",
          });
          
          // Switch to login mode and keep the email
          setIsLogin(true);
          setPassword(''); // Clear password for security
          setEmailError('');
          setPasswordError('');
        }
      }
    } catch (error) {
      logError(error, 'auth_general');
      toast({
        title: "Error inesperado",
        description: getSecureErrorMessage(error),
        variant: "destructive"
      });
    }
    
    setIsSubmitting(false);
  };

  const handleModeSwitch = () => {
    setIsLogin(!isLogin);
    setEmailError('');
    setPasswordError('');
    // Don't clear email to make it easier for users
    // Only clear password for security
    setPassword('');
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
          <p className="text-sage-600 handwritten">Tu diario privado digital</p>
        </div>

        <Card className="bg-card paper-texture gentle-shadow border-sage-200/50">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-serif-elegant text-sage-800 mb-2">
                {isLogin ? 'Bienvenida de vuelta' : 'Crear cuenta'}
              </h2>
              <p className="text-sm text-sage-600 handwritten">
                {isLogin ? 'Accede a tus momentos especiales' : 'Comienza a guardar tus recuerdos'}
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
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError('');
                    }}
                    placeholder="tu@email.com"
                    className={`pl-10 bg-cream-50 border-sage-200 focus:border-rose-300 ${
                      emailError ? 'border-red-300' : ''
                    }`}
                    required
                    autoComplete="email"
                  />
                </div>
                {emailError && (
                  <p className="text-xs text-red-600 mt-1 handwritten">
                    {emailError}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-sage-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-sage-400 z-10" />
                  <PasswordInput
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError('');
                    }}
                    placeholder="••••••••"
                    className={`pl-10 bg-cream-50 border-sage-200 focus:border-rose-300 ${
                      passwordError ? 'border-red-300' : ''
                    }`}
                    required
                    minLength={isLogin ? 6 : 12}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                  />
                </div>
                {passwordError && (
                  <p className="text-xs text-red-600 mt-1 handwritten">
                    {passwordError}
                  </p>
                )}
                
                {/* Password strength indicator for registration */}
                {!isLogin && password && (
                  <div className="mt-2">
                    <PasswordStrengthIndicator password={password} />
                  </div>
                )}
                
                {/* Security notice for registration */}
                {!isLogin && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-blue-700 handwritten">
                        Tu contraseña debe tener al menos 12 caracteres e incluir mayúsculas, minúsculas, números y símbolos.
                      </p>
                    </div>
                  </div>
                )}
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
                  onClick={handleModeSwitch}
                  className="text-sm text-sage-600 hover:text-sage-800 underline handwritten"
                >
                  {isLogin ? '¿No tienes cuenta? Crear una' : '¿Ya tienes cuenta? Iniciar sesión'}
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
