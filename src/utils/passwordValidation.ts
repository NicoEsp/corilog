
export interface PasswordStrength {
  score: number;
  feedback: string[];
  isValid: boolean;
}

export const validatePassword = (password: string): PasswordStrength => {
  const feedback: string[] = [];
  let score = 0;

  // Minimum length check
  if (password.length < 12) {
    feedback.push('La contraseña debe tener al menos 12 caracteres');
  } else {
    score += 1;
  }

  // Uppercase letter check
  if (!/[A-Z]/.test(password)) {
    feedback.push('Debe incluir al menos una letra mayúscula');
  } else {
    score += 1;
  }

  // Lowercase letter check
  if (!/[a-z]/.test(password)) {
    feedback.push('Debe incluir al menos una letra minúscula');
  } else {
    score += 1;
  }

  // Number check
  if (!/\d/.test(password)) {
    feedback.push('Debe incluir al menos un número');
  } else {
    score += 1;
  }

  // Special character check
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    feedback.push('Debe incluir al menos un carácter especial (!@#$%^&*)');
  } else {
    score += 1;
  }

  // Common patterns check
  if (/(.)\1{2,}/.test(password)) {
    feedback.push('Evita repetir caracteres consecutivamente');
    score -= 1;
  }

  // Sequential characters check
  if (/123|abc|qwe/i.test(password)) {
    feedback.push('Evita secuencias obvias de caracteres');
    score -= 1;
  }

  const isValid = score >= 4 && password.length >= 12;

  return {
    score: Math.max(0, Math.min(5, score)),
    feedback,
    isValid
  };
};

export const getPasswordStrengthText = (score: number): { text: string; color: string } => {
  switch (score) {
    case 0:
    case 1:
      return { text: 'Muy débil', color: 'text-red-600' };
    case 2:
      return { text: 'Débil', color: 'text-orange-600' };
    case 3:
      return { text: 'Regular', color: 'text-yellow-600' };
    case 4:
      return { text: 'Fuerte', color: 'text-blue-600' };
    case 5:
      return { text: 'Muy fuerte', color: 'text-green-600' };
    default:
      return { text: 'Muy débil', color: 'text-red-600' };
  }
};
