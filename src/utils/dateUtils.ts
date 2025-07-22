import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Utilidades de fecha centralizadas y optimizadas
export const DATE_FORMATS = {
  DISPLAY: "d 'de' MMMM, yyyy",
  SHORT: "d/MM/yyyy",
  MONTH_YEAR: "MMMM yyyy",
  ISO_DATE: "yyyy-MM-dd",
  RELATIVE: "relative",
} as const;

// Cache para formateo de fechas frecuentes
const formatCache = new Map<string, string>();

export const formatDate = (date: Date, formatType: keyof typeof DATE_FORMATS = 'DISPLAY'): string => {
  const cacheKey = `${date.getTime()}-${formatType}`;
  
  if (formatCache.has(cacheKey)) {
    return formatCache.get(cacheKey)!;
  }

  let formatted: string;
  
  switch (formatType) {
    case 'DISPLAY':
      formatted = format(date, DATE_FORMATS.DISPLAY, { locale: es });
      break;
    case 'SHORT':
      formatted = format(date, DATE_FORMATS.SHORT, { locale: es });
      break;
    case 'MONTH_YEAR':
      formatted = format(date, DATE_FORMATS.MONTH_YEAR, { locale: es });
      break;
    case 'ISO_DATE':
      formatted = format(date, DATE_FORMATS.ISO_DATE);
      break;
    case 'RELATIVE':
      formatted = getRelativeTime(date);
      break;
    default:
      formatted = format(date, DATE_FORMATS.DISPLAY, { locale: es });
  }

  // Limitar el cache a 100 entradas para evitar memory leaks
  if (formatCache.size >= 100) {
    const firstKey = formatCache.keys().next().value;
    formatCache.delete(firstKey);
  }
  
  formatCache.set(cacheKey, formatted);
  return formatted;
};

// Nueva función para formatear fechas para la base de datos sin conversión UTC
export const formatDateForDatabase = (date: Date): string => {
  // Extraer año, mes y día localmente sin conversión UTC
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  const formatted = `${year}-${month}-${day}`;
  console.log('📅 Formateando fecha para BD:', {
    fechaOriginal: date,
    fechaLocal: `${day}/${month}/${year}`,
    fechaParaBD: formatted,
    zonaHoraria: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  
  return formatted;
};

export const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInSeconds < 60) return 'Hace un momento';
  if (diffInMinutes < 60) return `Hace ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`;
  if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`;
  if (diffInDays < 7) return `Hace ${diffInDays} día${diffInDays !== 1 ? 's' : ''}`;
  if (diffInWeeks < 4) return `Hace ${diffInWeeks} semana${diffInWeeks !== 1 ? 's' : ''}`;
  if (diffInMonths < 12) return `Hace ${diffInMonths} mes${diffInMonths !== 1 ? 'es' : ''}`;
  return `Hace ${diffInYears} año${diffInYears !== 1 ? 's' : ''}`;
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const isThisWeek = (date: Date): boolean => {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return date >= weekAgo && date <= now;
};

export const isThisMonth = (date: Date): boolean => {
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
};

export const isThisYear = (date: Date): boolean => {
  const now = new Date();
  return date.getFullYear() === now.getFullYear();
};

// Validaciones de fecha
export const isValidDate = (date: any): date is Date => {
  return date instanceof Date && !isNaN(date.getTime());
};

export const isDateInRange = (date: Date, startDate?: Date, endDate?: Date): boolean => {
  if (startDate && date < startDate) return false;
  if (endDate && date > endDate) return false;
  return true;
};

// Utilidades para componentes
export const getMonthName = (monthIndex: number): string => {
  const date = new Date(2000, monthIndex, 1);
  return format(date, 'MMMM', { locale: es });
};

export const getYearFromDate = (date: Date): number => {
  return date.getFullYear();
};

export const getMonthFromDate = (date: Date): number => {
  return date.getMonth();
};

// Limpiar cache periódicamente
setInterval(() => {
  formatCache.clear();
}, 5 * 60 * 1000); // Cada 5 minutos
