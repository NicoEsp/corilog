import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEmailConfirmation } from '@/hooks/useEmailConfirmation';
import { useAuthForm } from '@/hooks/useAuthForm';
import { useAuthSubmit } from '@/hooks/useAuthSubmit';
import AuthForm from '@/components/auth/AuthForm';

const Auth = () => {
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(false); // Changed from true to false to default to sign-up
  
  // Use custom hooks
  useEmailConfirmation();
  const {
    email,
    setEmail,
    password,
    setPassword,
    emailError,
    passwordError,
    validateForm,
    clearErrors,
    clearPassword,
    setEmailError,
    setPasswordError
  } = useAuthForm(isLogin);
  const { isSubmitting, submitAuth } = useAuthSubmit();

  // Redirigir si ya está autenticado
  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await submitAuth(isLogin, email, password, validateForm);
    
    if (success && !isLogin) {
      // Switch to login mode and keep the email
      setIsLogin(true);
      clearPassword(); // Clear password for security
      clearErrors();
    }
  };

  const handleModeSwitch = () => {
    setIsLogin(!isLogin);
    clearErrors();
    // Don't clear email to make it easier for users
    // Only clear password for security
    clearPassword();
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

        <AuthForm
          isLogin={isLogin}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          emailError={emailError}
          passwordError={passwordError}
          setEmailError={setEmailError}
          setPasswordError={setPasswordError}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onModeSwitch={handleModeSwitch}
        />
      </div>
    </div>
  );
};

export default Auth;
