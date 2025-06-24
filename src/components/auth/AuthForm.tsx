
import { Card } from '@/components/ui/card';
import AuthFormFields from './AuthFormFields';
import AuthFormActions from './AuthFormActions';

interface AuthFormProps {
  isLogin: boolean;
  isForgotPassword?: boolean;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  emailError: string;
  passwordError: string;
  setEmailError: (error: string) => void;
  setPasswordError: (error: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onModeSwitch: () => void;
  onForgotPassword?: () => void;
}

const AuthForm = ({
  isLogin,
  isForgotPassword = false,
  email,
  setEmail,
  password,
  setPassword,
  emailError,
  passwordError,
  setEmailError,
  setPasswordError,
  isSubmitting,
  onSubmit,
  onModeSwitch,
  onForgotPassword
}: AuthFormProps) => {
  const getTitle = () => {
    if (isForgotPassword) return 'Restablecer contraseña';
    return isLogin ? 'Bienvenida de vuelta' : 'Crear cuenta';
  };

  const getSubtitle = () => {
    if (isForgotPassword) return 'Te enviaremos un enlace para restablecer tu contraseña';
    return isLogin ? 'Accede a tus momentos especiales' : 'Comienza a guardar tus recuerdos';
  };

  return (
    <Card className="bg-card paper-texture gentle-shadow border-sage-200/50">
      <form onSubmit={onSubmit} className="p-6 space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-serif-elegant text-sage-800 mb-2">
            {getTitle()}
          </h2>
          <p className="text-sm text-sage-600 handwritten">
            {getSubtitle()}
          </p>
        </div>

        <AuthFormFields
          isLogin={isLogin}
          isForgotPassword={isForgotPassword}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          emailError={emailError}
          passwordError={passwordError}
          setEmailError={setEmailError}
          setPasswordError={setPasswordError}
        />

        <AuthFormActions
          isLogin={isLogin}
          isForgotPassword={isForgotPassword}
          isSubmitting={isSubmitting}
          email={email}
          password={password}
          onModeSwitch={onModeSwitch}
          onForgotPassword={onForgotPassword}
        />
      </form>
    </Card>
  );
};

export default AuthForm;
