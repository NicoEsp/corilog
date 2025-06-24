
import { Card } from '@/components/ui/card';
import AuthFormFields from './AuthFormFields';
import AuthFormActions from './AuthFormActions';

interface AuthFormProps {
  isLogin: boolean;
  isForgotPassword?: boolean;
  isPasswordReset?: boolean;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword?: string;
  setConfirmPassword?: (password: string) => void;
  emailError: string;
  passwordError: string;
  confirmPasswordError?: string;
  setEmailError: (error: string) => void;
  setPasswordError: (error: string) => void;
  setConfirmPasswordError?: (error: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onModeSwitch: () => void;
  onForgotPassword?: () => void;
}

const AuthForm = ({
  isLogin,
  isForgotPassword = false,
  isPasswordReset = false,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  emailError,
  passwordError,
  confirmPasswordError,
  setEmailError,
  setPasswordError,
  setConfirmPasswordError,
  isSubmitting,
  onSubmit,
  onModeSwitch,
  onForgotPassword
}: AuthFormProps) => {
  const getTitle = () => {
    if (isPasswordReset) return 'Establecer nueva contraseña';
    if (isForgotPassword) return 'Restablecer contraseña';
    return isLogin ? 'Bienvenida de vuelta' : 'Crear cuenta';
  };

  const getSubtitle = () => {
    if (isPasswordReset) return 'Ingresa tu nueva contraseña para completar la recuperación';
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
          isPasswordReset={isPasswordReset}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          emailError={emailError}
          passwordError={passwordError}
          confirmPasswordError={confirmPasswordError}
          setEmailError={setEmailError}
          setPasswordError={setPasswordError}
          setConfirmPasswordError={setConfirmPasswordError}
        />

        <AuthFormActions
          isLogin={isLogin}
          isForgotPassword={isForgotPassword}
          isPasswordReset={isPasswordReset}
          isSubmitting={isSubmitting}
          email={email}
          password={password}
          confirmPassword={confirmPassword}
          onModeSwitch={onModeSwitch}
          onForgotPassword={onForgotPassword}
        />
      </form>
    </Card>
  );
};

export default AuthForm;
