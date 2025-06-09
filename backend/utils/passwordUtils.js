/**
 * Validates if a password meets UCOP standards:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character (!@#$%^&*()_+{}[]|:;<>,.?~)
 * 
 * @param {string} password - The password to validate
 * @returns {Object} - Object with isValid flag and error message if invalid
 */
const validatePassword = (password) => {
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
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('En az 1 özel karakter içermelidir (!@#$%^&*()_+-=[]{}|:;<>,.?)');
  }
  
  return {
    isValid: errors.length === 0,
    message: errors.length > 0 ? errors.join(', ') : ''
  };
};

module.exports = {
  validatePassword
}; 