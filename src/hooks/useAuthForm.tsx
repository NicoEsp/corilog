
import { useState } from 'react';
import { validateEmail } from '@/utils/inputSanitization';
import { validatePassword } from '@/utils/passwordValidation';

export const useAuthForm = (isLogin: boolean) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

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

  const clearErrors = () => {
    setEmailError('');
    setPasswordError('');
  };

  const clearPassword = () => {
    setPassword('');
  };

  return {
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
  };
};
