import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        logger.info('🔗 Processing OAuth callback', 'AuthCallback');
        
        // Verificar si hay una sesión válida después del OAuth
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          logger.error('❌ Error getting session in callback', 'auth_callback', error);
          navigate('/auth', { replace: true });
          return;
        }

        if (session?.user) {
          logger.info('✅ OAuth callback successful', 'AuthCallback', {
            userId: session.user.id,
            email: session.user.email,
            provider: session.user.app_metadata?.provider
          });
          
          // Redirigir al diario
          navigate('/diario', { replace: true });
        } else {
          logger.warn('⚠️ No session found after OAuth callback', 'AuthCallback');
          navigate('/auth', { replace: true });
        }
      } catch (error) {
        logger.error('💥 Error in OAuth callback', 'auth_callback_error', error);
        navigate('/auth', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600 mx-auto mb-4"></div>
        <p className="text-sage-600 handwritten">Completando autenticación...</p>
      </div>
    </div>
  );
};

export default AuthCallback;