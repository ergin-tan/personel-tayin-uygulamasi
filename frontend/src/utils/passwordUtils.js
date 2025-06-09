/**
 * şifre kontrol
 * 
 * @param {string} password - şifre
 * @returns {Object} - Object with isValid flag and error message if invalid
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    return {
      isValid: false,
      message: 'Şifre gereklidir.'
    };
  }
  
  if (password.length < 8) {
    errors.push('En az 8 karakter içermelidir');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('En az 1 büyük harf içermelidir');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('En az 1 küçük harf içermelidir');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('En az 1 rakam içermelidir');
  }
  // eslint-disable-next-line no-useless-escape
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('En az 1 özel karakter içermelidir (!@#$%^&*()_+-=[]{}|:;<>,.?)');
  }
  
  return {
    isValid: errors.length === 0,
    message: errors.length > 0 ? errors.join(', ') : ''
  };
};

/**
 * şifre güçlülüğünü hesapla
 * 
 * @param {string} password - şifre
 * @returns {Object} - Object with strength level and descriptive text
 */
export const getPasswordStrength = (password) => {
  if (!password) {
    return { level: 0, text: 'Zayıf' };
  }
  
  let score = 0;
  
  if (password.length >= 8) score += 1;
  if (password.length >= 10) score += 1;
  if (password.length >= 12) score += 1;
  
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  // eslint-disable-next-line no-useless-escape
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
  
  const uniqueChars = new Set(password.split('')).size;
  if (uniqueChars > 5) score += 1;
  if (uniqueChars > 8) score += 1;
  
  let level, text;
  if (score < 3) {
    level = 1;
    text = 'Çok Zayıf';
  } else if (score < 5) {
    level = 2;
    text = 'Zayıf';
  } else if (score < 7) {
    level = 3;
    text = 'Orta';
  } else if (score < 9) {
    level = 4;
    text = 'Güçlü';
  } else {
    level = 5;
    text = 'Çok Güçlü';
  }
  
  return { level, text };
};

/**
 * şifre güçlülüğünün sınıfını döndür
 * 
 * @param {number} strength - şifre güçlülüğü
 * @returns {string} - şifre güçlülüğünün sınıfı
 */
export const getPasswordStrengthClass = (strength) => {
  switch (strength) {
    case 1: return 'password-strength-very-weak';
    case 2: return 'password-strength-weak';
    case 3: return 'password-strength-medium';
    case 4: return 'password-strength-strong';
    case 5: return 'password-strength-very-strong';
    default: return 'password-strength-none';
  }
}; 