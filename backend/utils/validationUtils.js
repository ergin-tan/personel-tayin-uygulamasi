/**
 * Validates an email address
 * @param {string} email - The email address to validate
 * @returns {Object} - Object with isValid flag and error message if invalid
 */
const validateEmail = (email) => {
  if (!email) {
    return {
      isValid: false,
      message: 'Email adresi gereklidir.'
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      message: 'Geçerli bir email adresi giriniz.'
    };
  }
  
  return {
    isValid: true,
    message: ''
  };
};

/**
 * Validates a phone number (Turkish format)
 * @param {string} phone - The phone number to validate
 * @returns {Object} - Object with isValid flag and error message if invalid
 */
const validatePhone = (phone) => {
  if (!phone || phone.trim() === '') {
    return {
      isValid: false,
      message: 'Telefon numarası gereklidir.'
    };
  }

  if (!/^\d{11}$/.test(phone)) {
    return {
      isValid: false,
      message: 'Telefon numarası 11 haneli olmalıdır.'
    };
  }
  
  return {
    isValid: true,
    message: ''
  };
};

module.exports = {
  validateEmail,
  validatePhone
}; 