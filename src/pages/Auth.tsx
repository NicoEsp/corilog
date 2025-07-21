import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEmailConfirmation } from '@/hooks/useEmailConfirmation';
import { useAuthForm } from '@/hooks/useAuthForm';
import { useAuthSubmit } from '@/hooks/useAuthSubmit';
import { useForgotPassword } from '@/hooks/useForgotPassword';
import { usePasswordReset } from '@/hooks/usePasswordReset';
import AuthForm from '@/components/auth/AuthForm';

const Auth = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  // Use custom hooks
  const { isPasswordReset, setIsPasswordReset } = useEmailConfirmation();
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
  const { isSubmitting: isSubmittingReset, sendPasswordReset } = useForgotPassword();
  const { isSubmitting: isSubmittingPasswordReset, resetPassword } = usePasswordReset();

  // Set initial login state from navigation
  useEffect(() => {
    if (location.state?.isLogin !== undefined) {
      setIsLogin(location.state.isLogin);
    }
  }, [location.state]);

  // Redirigir si ya está autenticado (pero no si está en modo reset de contraseña)
  if (!loading && user && !isPasswordReset) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isPasswordReset) {
      const success = await resetPassword(password, confirmPassword);
      if (success) {
        // Reset completed successfully, user will be redirected automatically
        setIsPasswordReset(false);
      }
      return;
    }
    
    if (isForgotPassword) {
      const success = await sendPasswordReset(email);
      if (success) {
        // Switch back to login mode after successful reset
        setIsForgotPassword(false);
        setIsLogin(true);
        clearPassword();
        clearErrors();
      }
      return;
    }

    const success = await submitAuth(isLogin, email, password, validateForm);
    
    if (success && !isLogin) {
      // Switch to login mode and keep the email
      setIsLogin(true);
      clearPassword();
      clearErrors();
    }
  };

  const handleModeSwitch = () => {
    if (isForgotPassword) {
      // From forgot password back to login
      setIsForgotPassword(false);
      setIsLogin(true);
    } else {
      // Switch between login and signup
      setIsLogin(!isLogin);
    }
    clearErrors();
    clearPassword();
    setConfirmPassword('');
    setConfirmPasswordError('');
  };

  const handleForgotPassword = () => {
    setIsForgotPassword(true);
    setIsLogin(false);
    clearErrors();
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
          <h1 className="text-3xl font-semibold text-sage-800 mb-2">
            Corilog
          </h1>
          <p className="text-sage-600 font-medium">Tu diario privado digital</p>
        </div>

        <AuthForm
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
          isSubmitting={isSubmitting || isSubmittingReset || isSubmittingPasswordReset}
          onSubmit={handleSubmit}
          onModeSwitch={handleModeSwitch}
          onForgotPassword={handleForgotPassword}
        />
      </div>
    </div>
  );
};

export default Auth;
