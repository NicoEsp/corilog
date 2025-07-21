
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logError, getSecureErrorMessage } from '@/utils/errorHandling';
import { authRateLimiter } from '@/utils/rateLimiting';
import { assignUserRole } from '@/services/roleService';

export const useAuthSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    const rateLimitKey = `auth_${email}`;
    if (authRateLimiter.isBlocked(rateLimitKey)) {
      const remainingTime = authRateLimiter.getRemainingBlockTime(rateLimitKey);
      toast({
        title: "Demasiados intentos",
        description: `Espera ${remainingTime} minutos antes de intentar nuevamente`,
        variant: "destructive"
      });
      return false;
    }

    console.log('Iniciando login para mobile/desktop...');
    
    try {
      // Timeout para prevenir colgadas en mobile
      const loginPromise = supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Login timeout')), 30000); // 30 segundos
      });

      const { error } = await Promise.race([loginPromise, timeoutPromise]) as any;
      
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
        return false;
      } else {
        console.log('Login exitoso');
        toast({
          title: "¡Qué bueno verte de nuevo!",
          description: "Has iniciado sesión correctamente"
        });
        return true;
      }
    } catch (error: any) {
      console.error('Error en login:', error);
      if (error.message === 'Login timeout') {
        toast({
          title: "Conexión lenta",
          description: "El login está tardando más de lo esperado. Verifica tu conexión.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error de conexión",
          description: "Problema de conectividad. Verifica tu internet.",
          variant: "destructive"
        });
      }
      return false;
    }
  };

  const handleSignup = async (email: string, password: string) => {
    console.log('Iniciando registro de usuario...');
    
    try {
      const signupPromise = supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Signup timeout')), 30000); // 30 segundos
      });

      const { data, error } = await Promise.race([signupPromise, timeoutPromise]) as any;
      
      if (error) {
        logError(error, 'auth_signup');
        toast({
          title: "Error de registro",
          description: getSecureErrorMessage(error),
          variant: "destructive"
        });
        return false;
      } else if (data.user) {
        console.log('Usuario registrado exitosamente, asignando rol...');
        
        // Asignar rol automáticamente después del registro exitoso
        const roleResult = await assignUserRole(data.user.id, email.trim().toLowerCase());
        
        if (roleResult.success) {
          console.log('Rol asignado exitosamente');
          toast({
            title: "¡Cuenta creada exitosamente!",
            description: "Te hemos enviado un email de confirmación. Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.",
          });
        } else {
          console.log('Error asignando rol, pero usuario fue creado');
          toast({
            title: "¡Cuenta creada!",
            description: "Te hemos enviado un email de confirmación. Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.",
          });
        }
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error en signup:', error);
      if (error.message === 'Signup timeout') {
        toast({
          title: "Conexión lenta",
          description: "El registro está tardando más de lo esperado. Verifica tu conexión.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error de conexión",
          description: "Problema de conectividad. Verifica tu internet.",
          variant: "destructive"
        });
      }
      return false;
    }
  };

  const submitAuth = async (
    isLogin: boolean,
    email: string,
    password: string,
    validateForm: () => boolean
  ) => {
    if (!validateForm()) return false;

    setIsSubmitting(true);
    
    try {
      let success = false;
      if (isLogin) {
        success = await handleLogin(email, password);
      } else {
        success = await handleSignup(email, password);
      }
      return success;
    } catch (error) {
      console.error('Error general en auth:', error);
      logError(error, 'auth_general');
      toast({
        title: "Error inesperado",
        description: getSecureErrorMessage(error),
        variant: "destructive"
      });
      return false;
    } finally {
      // Asegurar que siempre se ejecute setIsSubmitting(false)
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitAuth
  };
};
