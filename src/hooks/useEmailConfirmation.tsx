
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logError, getSecureErrorMessage } from '@/utils/errorHandling';

export const useEmailConfirmation = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      
      if (error) {
        console.log('Email confirmation error:', error, errorDescription);
        if (error === 'access_denied' && errorDescription?.includes('expired')) {
          toast({
            title: "Enlace expirado",
            description: "El enlace de confirmación ha expirado. Puedes iniciar sesión normalmente con tu email y contraseña.",
            variant: "destructive"
          });
        }
        return;
      }

      // Check if this is a confirmation callback
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      
      if (accessToken && refreshToken) {
        try {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            logError(error, 'email_confirmation');
            toast({
              title: "Error de confirmación",
              description: getSecureErrorMessage(error),
              variant: "destructive"
            });
          } else {
            toast({
              title: "¡Email confirmado!",
              description: "Tu cuenta ha sido confirmada exitosamente. Ya puedes usar Corilog.",
            });
          }
        } catch (error) {
          logError(error, 'email_confirmation_general');
          toast({
            title: "Error de confirmación",
            description: "Hubo un problema confirmando tu email. Intenta iniciar sesión normalmente.",
            variant: "destructive"
          });
        }
      }
    };

    handleEmailConfirmation();
  }, [searchParams]);
};
