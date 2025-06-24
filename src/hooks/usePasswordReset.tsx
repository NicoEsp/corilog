
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { validatePassword } from '@/utils/passwordValidation';
import { logError, getSecureErrorMessage } from '@/utils/errorHandling';

export const usePasswordReset = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetPassword = async (newPassword: string, confirmPassword: string): Promise<boolean> => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Las contraseñas no coinciden",
        description: "Asegúrate de que ambas contraseñas sean iguales",
        variant: "destructive"
      });
      return false;
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      toast({
        title: "Contraseña no válida",
        description: "La contraseña no cumple con los requisitos de seguridad",
        variant: "destructive"
      });
      return false;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        logError(error, 'password_reset_update');
        toast({
          title: "Error al cambiar contraseña",
          description: getSecureErrorMessage(error),
          variant: "destructive"
        });
        return false;
      } else {
        toast({
          title: "Contraseña actualizada",
          description: "Tu contraseña ha sido cambiada exitosamente. Ya puedes usar Corilog.",
        });
        return true;
      }
    } catch (error) {
      logError(error, 'password_reset_update_general');
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
    resetPassword
  };
};
