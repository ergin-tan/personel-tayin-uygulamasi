/**
 * email kontrol
 * @param {string} email - email
 * @returns {Object} - Object with isValid flag and error message if invalid
 */
export const validateEmail = (email) => {
  if (!email) {
    return {
      isValid: false,
      message: 'Email adresi gereklidir.'
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  console.log('Email regex test for:', email, 'Result:', emailRegex.test(email));
  
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
 * telefon kontrol
 * @param {string} phone - telefon
 * @returns {Object} - Object with isValid flag and error message if invalid
 */
export const validatePhone = (phone) => {
  if (!phone || phone.trim() === '') {
    return {
      isValid: true,
      message: ''
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