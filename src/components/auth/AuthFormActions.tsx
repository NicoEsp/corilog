
import { Button } from '@/components/ui/button';
import { Camera, Mail, ArrowLeft, Lock } from 'lucide-react';

interface AuthFormActionsProps {
  isLogin: boolean;
  isForgotPassword?: boolean;
  isPasswordReset?: boolean;
  isSubmitting: boolean;
  email: string;
  password: string;
  confirmPassword?: string;
  onModeSwitch: () => void;
  onForgotPassword?: () => void;
}

const AuthFormActions = ({
  isLogin,
  isForgotPassword = false,
  isPasswordReset = false,
  isSubmitting,
  email,
  password,
  confirmPassword,
  onModeSwitch,
  onForgotPassword
}: AuthFormActionsProps) => {
  const getButtonText = () => {
    if (isPasswordReset) {
      return isSubmitting ? 'Actualizando contraseña...' : 'Actualizar contraseña';
    }
    if (isForgotPassword) {
      return isSubmitting ? 'Enviando email...' : 'Enviar email de recuperación';
    }
    return isSubmitting 
      ? (isLogin ? 'Iniciando sesión...' : 'Creando cuenta...') 
      : (isLogin ? 'Iniciar sesión' : 'Crear cuenta');
  };

  const getButtonIcon = () => {
    if (isPasswordReset) return <Lock className="w-4 h-4 mr-2" />;
    if (isForgotPassword) return <Mail className="w-4 h-4 mr-2" />;
    return <Camera className="w-4 h-4 mr-2" />;
  };

  const isButtonDisabled = () => {
    if (isPasswordReset) return isSubmitting || !password || !confirmPassword;
    if (isForgotPassword) return isSubmitting || !email;
    return isSubmitting || !email || !password;
  };

  return (
    <div className="space-y-4">
      <Button 
        type="submit" 
        className="w-full bg-rose-400 hover:bg-rose-500 text-white" 
        disabled={isButtonDisabled()}
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            {getButtonText()}
          </div>
        ) : (
          <>
            {getButtonIcon()}
            {getButtonText()}
          </>
        )}
      </Button>

      <div className="text-center space-y-2">
        {isForgotPassword ? (
          <button
            type="button"
            onClick={onModeSwitch}
            className="text-sm text-sage-600 hover:text-sage-800 underline handwritten flex items-center justify-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            ¿Recordaste tu contraseña? Volver al login
          </button>
        ) : !isPasswordReset && (
          <>
            <button
              type="button"
              onClick={onModeSwitch}
              className="text-sm text-sage-600 hover:text-sage-800 underline handwritten"
            >
              {isLogin ? '¿No tienes cuenta? Crear una' : '¿Ya tienes cuenta? Iniciar sesión'}
            </button>
            
            {isLogin && onForgotPassword && (
              <button
                type="button"
                onClick={onForgotPassword}
                className="block text-sm text-rose-500 hover:text-rose-700 underline handwritten mx-auto"
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AuthFormActions;
