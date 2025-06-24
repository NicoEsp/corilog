
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { validateEmail } from '@/utils/inputSanitization';
import { logError, getSecureErrorMessage } from '@/utils/errorHandling';
import { authRateLimiter } from '@/utils/rateLimiting';

export const useForgotPassword = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sendPasswordReset = async (email: string): Promise<boolean> => {
    if (!email || !validateEmail(email)) {
      toast({
        title: "Email inválido",
        description: "Por favor ingresa un email válido",
        variant: "destructive"
      });
      return false;
    }

    const rateLimitKey = `password_reset_${email}`;
    if (authRateLimiter.isBlocked(rateLimitKey)) {
      const remainingTime = authRateLimiter.getRemainingBlockTime(rateLimitKey);
      toast({
        title: "Demasiados intentos",
        description: `Espera ${remainingTime} minutos antes de intentar nuevamente`,
        variant: "destructive"
      });
      return false;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/auth`
        }
      );

      if (error) {
        // Record failed attempt
        authRateLimiter.recordAttempt(rateLimitKey);
        logError(error, 'password_reset');
        toast({
          title: "Error al enviar email",
          description: getSecureErrorMessage(error),
          variant: "destructive"
        });
        return false;
      } else {
        toast({
          title: "Email enviado",
          description: "Revisa tu email para restablecer tu contraseña. El enlace expira en 1 hora.",
        });
        return true;
      }
    } catch (error) {
      logError(error, 'password_reset_general');
      toast({
        title: "Error inesperado",
        description: getSecureErrorMessage(error),
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    sendPasswordReset
  };
};
