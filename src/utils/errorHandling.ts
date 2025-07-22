
// Secure error handling that doesn't leak sensitive information
export const getSecureErrorMessage = (error: any): string => {
  // Generic error messages that don't reveal system details
  const genericMessages = {
    auth: 'Error de autenticación. Verifica tus credenciales.',
    network: 'Error de conexión. Intenta nuevamente.',
    validation: 'Los datos ingresados no son válidos.',
    server: 'Error interno. Intenta nuevamente más tarde.',
    date: 'La fecha seleccionada no es válida.',
    default: 'Ocurrió un error inesperado. Intenta nuevamente.'
  };

  if (!error) return genericMessages.default;

  const errorMessage = error.message?.toLowerCase() || '';

  // Map specific Supabase errors to generic messages
  if (errorMessage.includes('invalid login credentials')) {
    return genericMessages.auth;
  }
  
  if (errorMessage.includes('user already registered')) {
    return 'Este email ya está registrado. Intenta iniciar sesión.';
  }
  
  if (errorMessage.includes('email not confirmed')) {
    return 'Debes confirmar tu email antes de iniciar sesión.';
  }
  
  if (errorMessage.includes('too many requests')) {
    return 'Demasiados intentos. Espera unos minutos antes de intentar nuevamente.';
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return genericMessages.network;
  }
  
  if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
    return genericMessages.validation;
  }

  if (errorMessage.includes('date') || errorMessage.includes('fecha')) {
    return genericMessages.date;
  }

  // Default to generic error message
  return genericMessages.default;
};

export const logError = (error: any, context: string) => {
  // In production, this would send to a secure logging service
  console.error(`[${context}]`, {
    message: error?.message || 'Unknown error',
    timestamp: new Date().toISOString(),
    context
  });
};

export const handleFormError = (error: any, context: string = 'form'): string => {
  logError(error, context);
  return getSecureErrorMessage(error);
};
