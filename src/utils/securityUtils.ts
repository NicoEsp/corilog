
// Security utilities for input validation and sanitization

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 320; // RFC 5321 limit
};

export const validateShareToken = (token: string): boolean => {
  return typeof token === 'string' && token.length > 0 && token.length <= 100;
};

export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const sanitizeText = (input: string): string => {
  return input.trim().replace(/[<>\"'&]/g, '');
};

export const validateLength = (text: string, maxLength: number): boolean => {
  return typeof text === 'string' && text.trim().length > 0 && text.length <= maxLength;
};

export const isValidUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:' || 
           (parsedUrl.protocol === 'http:' && parsedUrl.hostname === 'localhost');
  } catch {
    return false;
  }
};

// Rate limiting utility (client-side tracking)
class ClientRateLimit {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();

  check(key: string, maxAttempts: number = 5, windowMs: number = 3600000): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);

    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (attempt.count >= maxAttempts) {
      return false;
    }

    attempt.count++;
    return true;
  }

  getRemainingTime(key: string): number {
    const attempt = this.attempts.get(key);
    if (!attempt) return 0;
    return Math.max(0, attempt.resetTime - Date.now());
  }
}

export const shareRateLimit = new ClientRateLimit();
