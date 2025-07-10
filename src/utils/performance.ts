// Utilidades de performance y optimización
import React from 'react';
import { APP_CONFIG } from '@/config/constants';
import { logger } from './logger';

// Debounce function para búsquedas y inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = APP_CONFIG.SEARCH_DEBOUNCE_MS
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function para eventos de scroll
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number = 100
): (...args: Parameters<T>) => void {
  let lastFunc: NodeJS.Timeout;
  let lastRan: number;
  
  return (...args: Parameters<T>) => {
    if (!lastRan) {
      func(...args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if ((Date.now() - lastRan) >= limit) {
          func(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

// Cache para resultados computados
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    if (this.cache.has(key)) {
      // Move to end (mark as recently used)
      const value = this.cache.get(key)!;
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }
}

// Cache global para computaciones costosas
export const computationCache = new LRUCache<string, any>(50);

// Memoización manual para funciones puras
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new LRUCache<string, ReturnType<T>>(100);
  
  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    let result = cache.get(key);
    if (result === undefined) {
      result = fn(...args);
      cache.set(key, result);
    }
    
    return result;
  }) as T;
}

// Lazy loading para componentes pesados
export function lazyWithRetry<T extends React.ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  maxRetries: number = 3
): React.LazyExoticComponent<T> {
  return React.lazy(async () => {
    let retries = 0;
    while (retries < maxRetries) {
      try {
        return await componentImport();
      } catch (error) {
        retries++;
        logger.warn(`Lazy load attempt ${retries} failed`, 'lazyWithRetry', error);
        
        if (retries >= maxRetries) {
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
    }
    throw new Error('Max retries exceeded');
  });
}

// Observer para intersection (lazy loading de imágenes)
export class IntersectionObserverManager {
  private static instance: IntersectionObserver | null = null;
  private static callbacks = new Map<Element, () => void>();

  static getInstance(): IntersectionObserver {
    if (!this.instance) {
      this.instance = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const callback = this.callbacks.get(entry.target);
              if (callback) {
                callback();
                this.unobserve(entry.target);
              }
            }
          });
        },
        {
          root: null,
          rootMargin: '50px',
          threshold: 0.1,
        }
      );
    }
    return this.instance;
  }

  static observe(element: Element, callback: () => void): void {
    this.callbacks.set(element, callback);
    this.getInstance().observe(element);
  }

  static unobserve(element: Element): void {
    this.callbacks.delete(element);
    this.getInstance().unobserve(element);
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private static marks = new Map<string, number>();

  static startMark(name: string): void {
    this.marks.set(name, performance.now());
  }

  static endMark(name: string): number {
    const start = this.marks.get(name);
    if (!start) {
      logger.warn(`No start mark found for: ${name}`, 'PerformanceMonitor');
      return 0;
    }

    const duration = performance.now() - start;
    this.marks.delete(name);
    
    if (duration > 100) { // Log slow operations
      logger.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`, 'PerformanceMonitor');
    }
    
    return duration;
  }
}