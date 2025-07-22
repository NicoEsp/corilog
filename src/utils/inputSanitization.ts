
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

export const validateDate = (date: Date | string | null | undefined): boolean => {
  // Handle empty or null values
  if (!date) return false;
  
  let dateObj: Date;
  
  try {
    // If it's a string, try to create a Date object
    if (typeof date === 'string') {
      // Handle empty string
      if (date.trim() === '') return false;
      dateObj = new Date(date);
    } else {
      dateObj = date;
    }
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) return false;
    
    const now = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(now.getFullYear() + 1);
    
    const hundredYearsAgo = new Date();
    hundredYearsAgo.setFullYear(now.getFullYear() - 100);
    
    return dateObj >= hundredYearsAgo && dateObj <= oneYearFromNow;
  } catch (error) {
    // If any error occurs during date creation or validation, return false
    return false;
  }
};

export const createSafeDate = (dateInput: string | Date | null | undefined): Date => {
  // If no date provided, use current date
  if (!dateInput) {
    return new Date();
  }
  
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    
    // If date is invalid, use current date
    if (isNaN(date.getTime())) {
      console.warn('Invalid date provided, using current date as fallback');
      return new Date();
    }
    
    return date;
  } catch (error) {
    console.warn('Error creating date, using current date as fallback:', error);
    return new Date();
  }
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
