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
        
        // Pequeño delay para permitir que Supabase procese completamente el OAuth
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Retry logic para manejar casos donde la sesión no está lista inmediatamente
        let attempts = 0;
        const maxAttempts = 3;
        let session = null;
        
        while (attempts < maxAttempts && !session) {
          attempts++;
          logger.info(`🔄 Attempting to get session (attempt ${attempts}/${maxAttempts})`, 'AuthCallback');
          
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            logger.error('❌ Error getting session in callback', 'auth_callback', error);
            if (attempts === maxAttempts) {
              navigate('/auth', { replace: true });
              return;
            }
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          
          session = data.session;
          
          if (!session && attempts < maxAttempts) {
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        if (session?.user) {
          logger.info('✅ OAuth callback successful', 'AuthCallback', {
            userId: session.user.id,
            email: session.user.email,
            provider: session.user.app_metadata?.provider,
            attempts
          });
          
          // Preload datos críticos antes de redireccionar
          const { queryClient } = await import('@/lib/queryClient');
          
          // Prefetch momentos para cargar inmediatamente
          setTimeout(() => {
            queryClient.prefetchQuery({
              queryKey: ['moments', session.user.id],
              staleTime: 0 // Forzar fresh data
            });
            
            queryClient.prefetchQuery({
              queryKey: ['streakData', session.user.id],
              staleTime: 0
            });
          }, 200);
          
          // Redirigir al diario después de iniciar prefetch
          setTimeout(() => {
            navigate('/diario', { replace: true });
          }, 300);
        } else {
          logger.warn('⚠️ No session found after OAuth callback after all attempts', 'AuthCallback');
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