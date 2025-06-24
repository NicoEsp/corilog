
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';

interface AuthFormActionsProps {
  isLogin: boolean;
  isSubmitting: boolean;
  email: string;
  password: string;
  onModeSwitch: () => void;
}

const AuthFormActions = ({
  isLogin,
  isSubmitting,
  email,
  password,
  onModeSwitch
}: AuthFormActionsProps) => {
  return (
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
          onClick={onModeSwitch}
          className="text-sm text-sage-600 hover:text-sage-800 underline handwritten"
        >
          {isLogin ? '¿No tienes cuenta? Crear una' : '¿Ya tienes cuenta? Iniciar sesión'}
        </button>
      </div>
    </div>
  );
};

export default AuthFormActions;
