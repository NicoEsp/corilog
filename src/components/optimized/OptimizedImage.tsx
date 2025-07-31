import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Image } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { APP_CONFIG } from '@/config/constants';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: React.ReactNode;
  priority?: boolean; // Para imágenes críticas
  sizes?: string; // Para responsive images
}

/**
 * Componente de imagen optimizado para móvil
 * - Carga adaptativa según viewport
 * - Compresión automática
 * - Blur-to-sharp loading
 * - Cache inteligente
 */
const OptimizedImage = memo(({ 
  src, 
  alt, 
  className = '', 
  placeholder,
  priority = false,
  sizes = '(max-width: 768px) 100vw, 50vw'
}: OptimizedImageProps) => {
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  const [imageSrc, setImageSrc] = useState<string>('');
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: APP_CONFIG.IMAGE_LAZY_THRESHOLD,
    rootMargin: APP_CONFIG.IMAGE_ROOT_MARGIN,
  });
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Optimizar src para diferentes dispositivos
  const getOptimizedSrc = useCallback((originalSrc: string) => {
    if (!originalSrc) return '';
    
    // Si es una URL de Supabase Storage, optimizar
    if (originalSrc.includes('supabase')) {
      const isMobile = window.innerWidth < APP_CONFIG.BREAKPOINTS.md;
      const quality = APP_CONFIG.IMAGE_QUALITY;
      const width = isMobile ? 400 : 800;
      
      // Agregar parámetros de optimización si es posible
      const separator = originalSrc.includes('?') ? '&' : '?';
      return `${originalSrc}${separator}width=${width}&quality=${Math.round(quality * 100)}`;
    }
    
    return originalSrc;
  }, []);

  const handleLoad = useCallback(() => {
    setLoadState('loaded');
  }, []);

  const handleError = useCallback(() => {
    setLoadState('error');
  }, []);

  // Comenzar a cargar cuando sea visible (o inmediatamente si es priority)
  useEffect(() => {
    if ((isIntersecting || priority) && loadState === 'idle') {
      setLoadState('loading');
      setImageSrc(getOptimizedSrc(src));
    }
  }, [isIntersecting, priority, loadState, src, getOptimizedSrc]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (imgRef.current) {
        imgRef.current.onload = null;
        imgRef.current.onerror = null;
      }
    };
  }, []);

  if (loadState === 'error') {
    return (
      <div ref={ref} className={`bg-sage-100 flex items-center justify-center ${className}`}>
        <Image className="w-6 h-6 text-sage-400" />
      </div>
    );
  }

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {/* Blur placeholder mejorado */}
      {loadState !== 'loaded' && (
        <div className="absolute inset-0 bg-gradient-to-br from-sage-50 to-sage-100 animate-pulse flex items-center justify-center">
          {placeholder || <Image className="w-6 h-6 text-sage-400" />}
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] -translate-x-full" />
        </div>
      )}
      
      {/* Imagen optimizada */}
      {loadState !== 'idle' && imageSrc && (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt}
          sizes={sizes}
          className={`w-full h-full object-cover transition-all duration-300 select-none ${
            loadState === 'loaded' 
              ? 'opacity-100 blur-0 scale-100' 
              : 'opacity-0 blur-sm scale-105'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          // Responsive loading hint
          decoding="async"
        />
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';
export default OptimizedImage;