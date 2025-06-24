
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
      return false;
    } else {
      toast({
        title: "¡Bienvenida de vuelta!",
        description: "Has iniciado sesión correctamente"
      });
      return true;
    }
  };

  const handleSignup = async (email: string, password: string) => {
    console.log('Iniciando registro de usuario...');
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: 'https://corilog.lovable.app'
      }
    });
    
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
          description: "Revisa tu email para confirmar tu cuenta. Mientras tanto, ya puedes iniciar sesión.",
        });
      } else {
        console.log('Error asignando rol, pero usuario fue creado');
        toast({
          title: "¡Cuenta creada!",
          description: "Revisa tu email para confirmar tu cuenta. Si tienes problemas de acceso, contacta al soporte.",
        });
      }
      return true;
    }
    return false;
  };

  const submitAuth = async (
    isLogin: boolean,
    email: string,
    password: string,
    validateForm: () => boolean
  ) => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      if (isLogin) {
        await handleLogin(email, password);
      } else {
        const success = await handleSignup(email, password);
        return success;
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

  return {
    isSubmitting,
    submitAuth
  };
};
