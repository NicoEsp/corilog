import React, { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { APP_CONFIG } from '@/config/constants';

/**
 * Componente que aplica optimizaciones específicas para móvil
 * - Touch optimizations
 * - Performance hints
 * - Viewport optimizations
 */
export const MobileOptimizations: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isMobile = useIsMobile();
  const [isLowPower, setIsLowPower] = useState(false);

  useEffect(() => {
    if (!isMobile) return;

    // Detectar modo de ahorro de energía
    const checkPowerMode = () => {
      // @ts-ignore - Feature detection
      if ('connection' in navigator && navigator.connection?.saveData) {
        setIsLowPower(true);
      }
    };

    // Optimizaciones de viewport para móvil
    const optimizeViewport = () => {
      // Prevenir zoom accidental
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
        );
      }

      // Optimizar scroll en iOS
      (document.body.style as any).webkitOverflowScrolling = 'touch';
      document.body.style.overscrollBehavior = 'none';
    };

    // Optimizar touch events
    const optimizeTouchEvents = () => {
      // Reducir delay de touch
      document.body.style.touchAction = 'manipulation';
      
      // Mejorar responsividad táctil
      const style = document.createElement('style');
      style.textContent = `
        * {
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
        }
        
        button, [role="button"], .cursor-pointer {
          -webkit-user-select: none;
          user-select: none;
          touch-action: manipulation;
        }
        
        /* Feedback táctil inmediato */
        .touch-manipulation:active {
          transform: scale(${APP_CONFIG.MOBILE_SCALE});
          transition: transform ${APP_CONFIG.TOUCH_DELAY_MS}ms ease-out;
        }
      `;
      document.head.appendChild(style);
    };

    // Performance hints para el browser
    const addPerformanceHints = () => {
      // Preload critical resources
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.href = '/fonts/serif.woff2'; // Ajustar según tus fonts
      preloadLink.as = 'font';
      preloadLink.type = 'font/woff2';
      preloadLink.crossOrigin = 'anonymous';
      document.head.appendChild(preloadLink);

      // Resource hints
      const dnsLink = document.createElement('link');
      dnsLink.rel = 'dns-prefetch';
      dnsLink.href = 'https://xgukkzjwudbxyiohspsv.supabase.co';
      document.head.appendChild(dnsLink);
    };

    checkPowerMode();
    optimizeViewport();
    optimizeTouchEvents();
    addPerformanceHints();

    // Cleanup
    return () => {
      (document.body.style as any).webkitOverflowScrolling = '';
      document.body.style.overscrollBehavior = '';
      document.body.style.touchAction = '';
    };
  }, [isMobile]);

  // Aplicar clase condicional para optimizaciones
  useEffect(() => {
    if (isMobile) {
      document.documentElement.classList.add('mobile-optimized');
      if (isLowPower) {
        document.documentElement.classList.add('low-power-mode');
      }
    }

    return () => {
      document.documentElement.classList.remove('mobile-optimized', 'low-power-mode');
    };
  }, [isMobile, isLowPower]);

  return <>{children}</>;
};

/**
 * Hook para detectar capacidades del dispositivo
 */
export const useDeviceCapabilities = () => {
  const [capabilities, setCapabilities] = useState({
    supportsWebP: false,
    supportsAvif: false,
    isLowPower: false,
    connectionSpeed: 'unknown' as 'slow' | 'fast' | 'unknown',
  });

  useEffect(() => {
    const detectCapabilities = async () => {
      // Detectar soporte de formatos de imagen
      const supportsWebP = await new Promise<boolean>((resolve) => {
        const webP = new Image();
        webP.onload = webP.onerror = () => resolve(webP.height === 2);
        webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
      });

      const supportsAvif = await new Promise<boolean>((resolve) => {
        const avif = new Image();
        avif.onload = avif.onerror = () => resolve(avif.height === 2);
        avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=';
      });

      // @ts-ignore - Feature detection
      const connection = navigator.connection;
      const isLowPower = connection?.saveData || false;
      const connectionSpeed = connection?.effectiveType === '4g' || connection?.effectiveType === '3g' ? 'fast' : 'slow';

      setCapabilities({
        supportsWebP,
        supportsAvif,
        isLowPower,
        connectionSpeed: connectionSpeed || 'unknown',
      });
    };

    detectCapabilities();
  }, []);

  return capabilities;
};