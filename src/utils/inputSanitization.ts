
// Input sanitization utilities for security
export const sanitizeText = (input: string): string => {
  if (!input) return '';
  
  // Remove potential XSS characters and normalize
  return input
    .trim()
    .replace(/[<>'"]/g, '') // Remove basic XSS characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .substring(0, 1000); // Limit length
};

export const sanitizeTitle = (title: string): string => {
  if (!title) return '';
  
  return sanitizeText(title).substring(0, 100); // Limit title length
};

export const sanitizeNote = (note: string): string => {
  if (!note) return '';
  
  return sanitizeText(note).substring(0, 2000); // Limit note length
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validateDate = (date: Date): boolean => {
  const now = new Date();
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(now.getFullYear() + 1);
  
  const hundredYearsAgo = new Date();
  hundredYearsAgo.setFullYear(now.getFullYear() - 100);
  
  return date >= hundredYearsAgo && date <= oneYearFromNow;
};

export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Solo se permiten imágenes JPG, PNG o WebP'
    };
  }
  
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'La imagen no puede superar los 5MB'
    };
  }
  
  return { isValid: true };
};
