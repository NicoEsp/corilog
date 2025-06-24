
import { Card } from '@/components/ui/card';
import AuthFormFields from './AuthFormFields';
import AuthFormActions from './AuthFormActions';

interface AuthFormProps {
  isLogin: boolean;
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
}

const AuthForm = ({
  isLogin,
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
  onModeSwitch
}: AuthFormProps) => {
  return (
    <Card className="bg-card paper-texture gentle-shadow border-sage-200/50">
      <form onSubmit={onSubmit} className="p-6 space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-serif-elegant text-sage-800 mb-2">
            {isLogin ? 'Bienvenida de vuelta' : 'Crear cuenta'}
          </h2>
          <p className="text-sm text-sage-600 handwritten">
            {isLogin ? 'Accede a tus momentos especiales' : 'Comienza a guardar tus recuerdos'}
          </p>
        </div>

        <AuthFormFields
          isLogin={isLogin}
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
          isSubmitting={isSubmitting}
          email={email}
          password={password}
          onModeSwitch={onModeSwitch}
        />
      </form>
    </Card>
  );
};

export default AuthForm;
