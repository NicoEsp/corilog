
import { useState, useCallback, useEffect } from 'react';
import { APP_CONFIG } from '@/config/constants';

interface GooglePickerHookProps {
  onFileSelected: (file: any) => void;
  clientId: string;
}

export const useGooglePicker = ({ onFileSelected, clientId }: GooglePickerHookProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Cargar Google APIs dinámicamente
  useEffect(() => {
    const loadGoogleAPIs = async () => {
      try {
        console.log('📚 Cargando Google APIs...');
        
        // Verificar si ya están cargadas
        if (window.gapi && window.google?.picker) {
          setIsGoogleLoaded(true);
          return;
        }

        // Cargar GAPI
        if (!window.gapi) {
          await loadScript('https://apis.google.com/js/api.js');
        }

        // Cargar Google Picker
        if (!window.google?.picker) {
          await loadScript('https://apis.google.com/js/api.js?onload=onGapiLoad');
        }

        // Inicializar GAPI
        await new Promise<void>((resolve, reject) => {
          window.gapi.load('auth2:picker', {
            callback: resolve,
            onerror: reject,
          });
        });

        console.log('✅ Google APIs cargadas exitosamente');
        setIsGoogleLoaded(true);
      } catch (error) {
        console.error('❌ Error cargando Google APIs:', error);
        setError('No se pudieron cargar las APIs de Google');
      }
    };

    loadGoogleAPIs();
  }, []);

  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  };

  const authenticateUser = useCallback(async (): Promise<boolean> => {
    try {
      setIsAuthenticating(true);
      console.log('🔐 Autenticando con Google...');

      // Inicializar auth2 si no está inicializado
      let authInstance = window.gapi.auth2.getAuthInstance();
      
      if (!authInstance) {
        authInstance = await window.gapi.auth2.init({
          client_id: clientId,
          scope: APP_CONFIG.GOOGLE_PICKER.SCOPE,
        });
      }

      // Verificar si ya está autenticado
      if (authInstance.isSignedIn.get()) {
        console.log('✅ Usuario ya autenticado');
        return true;
      }

      // Solicitar autenticación
      const user = await authInstance.signIn();
      const isAuthorized = user.hasGrantedScopes(APP_CONFIG.GOOGLE_PICKER.SCOPE);
      
      if (!isAuthorized) {
        throw new Error('El usuario no concedió los permisos necesarios');
      }

      console.log('✅ Autenticación exitosa');
      return true;
    } catch (error) {
      console.error('❌ Error en autenticación:', error);
      setError('Error de autenticación con Google');
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, [clientId]);

  const openPicker = useCallback(async () => {
    if (!isGoogleLoaded) {
      setError('Google APIs no están cargadas');
      return;
    }

    if (!clientId) {
      setError('Client ID de Google no configurado');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Autenticar usuario
      const isAuthenticated = await authenticateUser();
      if (!isAuthenticated) {
        return;
      }

      // Obtener token de acceso
      const authInstance = window.gapi.auth2.getAuthInstance();
      const user = authInstance.currentUser.get();
      const accessToken = user.getAuthResponse().access_token;

      console.log('🎯 Abriendo Google Picker...');

      // Crear y configurar Google Picker
      const picker = new window.google.picker.PickerBuilder()
        .addView(window.google.picker.ViewId.DOCS_IMAGES)
        .addView(window.google.picker.ViewId.PHOTOS)
        .setOAuthToken(accessToken)
        .setDeveloperKey(clientId) // Usar client_id como developer key por ahora
        .setCallback((data: any) => {
          console.log('📤 Respuesta de Google Picker:', data);
          
          if (data.action === window.google.picker.Action.PICKED) {
            const file = data.docs[0];
            console.log('✅ Archivo seleccionado:', file);
            onFileSelected(file);
          } else if (data.action === window.google.picker.Action.CANCEL) {
            console.log('❌ Usuario canceló la selección');
          }
        })
        .build();

      picker.setVisible(true);
    } catch (error) {
      console.error('❌ Error abriendo Google Picker:', error);
      setError('Error al abrir Google Picker');
    } finally {
      setIsLoading(false);
    }
  }, [isGoogleLoaded, clientId, authenticateUser, onFileSelected]);

  return {
    openPicker,
    isLoading: isLoading || !isGoogleLoaded,
    isAuthenticating,
    error,
    isGoogleLoaded,
  };
};

// Declaraciones para TypeScript
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}
