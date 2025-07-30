
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logError, getSecureErrorMessage } from '@/utils/errorHandling';

export const useGoogleAuth = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signInWithGoogle = async () => {
    setIsSubmitting(true);
    
    try {
      console.log('🔄 Iniciando autenticación con Google...');
      
      // Limpiar estado de autenticación antes del OAuth
      try {
        console.log('🧹 Limpiando estado de auth...');
        await supabase.auth.signOut({ scope: 'local' });
      } catch (cleanupError) {
        console.log('ℹ️ Ignorando error de limpieza:', cleanupError);
      }

      // Configurar redirect más específico para OAuth
      const redirectTo = `${window.location.origin}/auth/callback`;
      console.log('🔗 Redirect configurado a:', redirectTo);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account'
          }
        }
      });

      if (error) {
        console.error('❌ Error en OAuth:', error);
        logError(error, 'google_auth');
        toast({
          title: "Error con Google",
          description: getSecureErrorMessage(error),
          variant: "destructive"
        });
        return false;
      }

      console.log('✅ OAuth iniciado correctamente - esperando redirección...');
      // El login con OAuth se maneja automáticamente por la redirección
      // No necesitamos toast de éxito aquí porque la página se recargará
      return true;
    } catch (error: any) {
      console.error('💥 Error general en Google auth:', error);
      logError(error, 'google_auth_general');
      toast({
        title: "Error de conexión",
        description: "Problema al conectar con Google. Verifica tu conexión.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    signInWithGoogle
  };
};
