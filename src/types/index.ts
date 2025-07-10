// Tipos centralizados para toda la aplicación
export * from './moment';
export * from './sharedMoment';

// Tipos de UI comunes
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

export interface PaginationState {
  hasMore: boolean;
  isLoadingMore: boolean;
  total?: number;
}

// Tipos de formularios
export interface FormState<T = any> {
  data: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isDirty: boolean;
}

// Tipos de autenticación
export interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
}

// Tipos de respuesta de API
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

// Tipos de eventos
export interface ComponentEventHandlers {
  onClick?: (e: React.MouseEvent) => void;
  onSubmit?: (e: React.FormEvent) => void;
  onChange?: (value: any) => void;
}

// Tipos de configuración
export interface AppTheme {
  mode: 'light' | 'dark';
  primaryColor: string;
  fontFamily: string;
}

// Tipos para hooks personalizados
export interface UseQueryResult<T> extends LoadingState {
  data: T | null;
  refetch: () => void;
}

export interface UseMutationResult<T = any> {
  mutate: (data: T) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// Tipos de utilidades
export type Nullable<T> = T | null;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};