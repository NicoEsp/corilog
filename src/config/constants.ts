// Configuración centralizada de la aplicación
export const APP_CONFIG = {
  // Paginación
  MOMENTS_PER_PAGE: 10,
  INFINITE_QUERY_PAGE_SIZE: 10,
  
  // Límites de archivos
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  
  // Validaciones de texto
  MAX_TITLE_LENGTH: 100,
  MAX_NOTE_LENGTH: 2000,
  MAX_TEXT_LENGTH: 1000,
  
  // Cache y performance
  QUERY_STALE_TIME: 1000 * 60 * 5, // 5 minutos
  QUERY_GC_TIME: 1000 * 60 * 30, // 30 minutos
  
  // Debounce y delays
  SEARCH_DEBOUNCE_MS: 300,
  LOADING_DELAY_MS: 200,
  
  // Animaciones
  TRANSITION_DURATION: 300,
  HOVER_SCALE: 1.02,
  ACTIVE_SCALE: 0.98,
  
  // Breakpoints (matching Tailwind)
  BREAKPOINTS: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
} as const;

// URLs y rutas
export const ROUTES = {
  HOME: '/home',
  DIARIO: '/diario',
  AUTH: '/auth',
  SHARED_MOMENT: '/shared',
  NOT_FOUND: '/404',
} as const;

// Mensajes de la aplicación
export const MESSAGES = {
  ERRORS: {
    GENERIC: 'Ocurrió un error inesperado. Intenta nuevamente.',
    NETWORK: 'Error de conexión. Verifica tu internet.',
    AUTH: 'Error de autenticación. Verifica tus credenciales.',
    VALIDATION: 'Los datos ingresados no son válidos.',
    FILE_SIZE: `El archivo no puede superar los ${APP_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`,
    FILE_TYPE: 'Solo se permiten imágenes JPG, PNG o WebP',
  },
  SUCCESS: {
    MOMENT_CREATED: 'Momento guardado exitosamente',
    MOMENT_DELETED: 'Momento eliminado',
    MOMENT_FEATURED: 'Momento destacado',
    MOMENT_UNFEATURED: 'Momento no destacado',
  },
} as const;

// Tipos derivados para type safety
export type Route = typeof ROUTES[keyof typeof ROUTES];
export type ErrorMessage = typeof MESSAGES.ERRORS[keyof typeof MESSAGES.ERRORS];
export type SuccessMessage = typeof MESSAGES.SUCCESS[keyof typeof MESSAGES.SUCCESS];