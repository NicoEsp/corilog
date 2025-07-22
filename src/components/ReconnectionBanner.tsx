
import { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/utils/logger';

const ReconnectionBanner = () => {
  const { isReconnecting, session, forceRefresh } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Mostrar banner si no hay sesión después del loading inicial y no está reconectando
    const shouldShow = !session && !isReconnecting && !isDismissed;
    
    if (shouldShow !== showBanner) {
      setShowBanner(shouldShow);
      
      if (shouldShow) {
        logger.info('Showing reconnection banner - no session detected', 'ReconnectionBanner');
      }
    }
  }, [session, isReconnecting, isDismissed, showBanner]);

  const handleReconnect = async () => {
    logger.info('User initiated manual reconnection', 'ReconnectionBanner');
    setIsDismissed(false);
    await forceRefresh();
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setShowBanner(false);
    logger.info('User dismissed reconnection banner', 'ReconnectionBanner');
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4 mx-4 rounded-r-lg shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-amber-800">
              Problema de conexión detectado
            </h3>
            <p className="text-sm text-amber-700 mt-1">
              Tu sesión se ha desconectado. Haz clic en "Reconectar" para recuperar tus momentos.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <Button
            onClick={handleReconnect}
            disabled={isReconnecting}
            size="sm"
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isReconnecting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Reconectando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reconectar
              </>
            )}
          </Button>
          
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="text-amber-600 hover:text-amber-800 hover:bg-amber-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReconnectionBanner;
