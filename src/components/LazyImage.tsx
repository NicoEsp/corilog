
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Image } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: React.ReactNode;
}

const LazyImage = ({ src, alt, className = '', placeholder }: LazyImageProps) => {
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
  });
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Memoizar callbacks para evitar recreación
  const handleLoad = useCallback(() => {
    setLoadState('loaded');
  }, []);

  const handleError = useCallback(() => {
    setLoadState('error');
  }, []);

  // Comenzar a cargar la imagen cuando sea visible
  useEffect(() => {
    if (isIntersecting && loadState === 'idle') {
      setLoadState('loading');
    }
  }, [isIntersecting, loadState]);

  // Cleanup de imagen si el componente se desmonta
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
      {/* Placeholder mientras carga */}
      {loadState !== 'loaded' && (
        <div className="absolute inset-0 bg-sage-100 animate-pulse flex items-center justify-center">
          {placeholder || <Image className="w-6 h-6 text-sage-400" />}
        </div>
      )}
      
      {/* Imagen real */}
      {loadState !== 'idle' && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            loadState === 'loaded' ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}
    </div>
  );
};

export default LazyImage;
