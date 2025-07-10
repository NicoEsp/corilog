// Sistema de logging centralizado y optimizado
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  timestamp: string;
  level: LogLevel;
  context?: string;
  data?: any;
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development';
  
  private formatMessage(level: LogLevel, message: string, context?: string, data?: any): LogContext {
    return {
      timestamp: new Date().toISOString(),
      level,
      context,
      data,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.isDev) {
      // En producción, solo logear errores y warnings
      return level === 'error' || level === 'warn';
    }
    return true;
  }

  debug(message: string, context?: string, data?: any) {
    if (!this.shouldLog('debug')) return;
    
    const logData = this.formatMessage('debug', message, context, data);
    console.debug(`🔧 [${context || 'DEBUG'}]`, message, data);
  }

  info(message: string, context?: string, data?: any) {
    if (!this.shouldLog('info')) return;
    
    const logData = this.formatMessage('info', message, context, data);
    console.info(`ℹ️ [${context || 'INFO'}]`, message, data);
  }

  warn(message: string, context?: string, data?: any) {
    if (!this.shouldLog('warn')) return;
    
    const logData = this.formatMessage('warn', message, context, data);
    console.warn(`⚠️ [${context || 'WARN'}]`, message, data);
  }

  error(message: string, context?: string, data?: any) {
    if (!this.shouldLog('error')) return;
    
    const logData = this.formatMessage('error', message, context, data);
    console.error(`❌ [${context || 'ERROR'}]`, message, data);
    
    // En producción, aquí se podría enviar a un servicio de logging
    if (!this.isDev) {
      this.sendToLoggingService(logData);
    }
  }

  private sendToLoggingService(logData: LogContext) {
    // Implementar envío a servicio de logging en producción
    // Por ejemplo: Sentry, LogRocket, etc.
  }
}

// Exportar instancia singleton
export const logger = new Logger();

// Funciones de conveniencia para mantener compatibilidad
export const logError = (error: any, context: string) => {
  logger.error(error?.message || 'Unknown error', context, error);
};

export const logInfo = (message: string, context?: string, data?: any) => {
  logger.info(message, context, data);
};

export const logDebug = (message: string, context?: string, data?: any) => {
  logger.debug(message, context, data);
};