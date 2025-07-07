
import { useEffect, useRef, useState, useCallback } from 'react';

interface UseIntersectionObserverProps {
  threshold?: number;
  rootMargin?: string;
}

// Singleton observer para reutilizar instancias
const createObserverManager = () => {
  const observerMap = new Map<string, IntersectionObserver>();
  const elementMap = new WeakMap<Element, () => void>();
  
  const getObserver = (options: IntersectionObserverInit): IntersectionObserver => {
    const key = `${options.threshold}-${options.rootMargin}`;
    
    if (!observerMap.has(key)) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const callback = elementMap.get(entry.target);
          if (callback) {
            callback();
          }
        });
      }, options);
      
      observerMap.set(key, observer);
    }
    
    return observerMap.get(key)!;
  };
  
  const observe = (element: Element, callback: () => void, options: IntersectionObserverInit) => {
    const observer = getObserver(options);
    elementMap.set(element, callback);
    observer.observe(element);
    
    return () => {
      observer.unobserve(element);
      elementMap.delete(element);
    };
  };

  return {
    getObserver,
    observe
  };
};

const observerManager = createObserverManager();

export const useIntersectionObserver = ({
  threshold = 1.0,
  rootMargin = '0px',
}: UseIntersectionObserverProps = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Memoizar callback para evitar recreación
  const handleIntersection = useCallback(() => {
    setIsIntersecting(true);
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const options = { threshold, rootMargin };
    cleanupRef.current = observerManager.observe(element, handleIntersection, options);

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [threshold, rootMargin, handleIntersection]);

  return { ref, isIntersecting };
};
