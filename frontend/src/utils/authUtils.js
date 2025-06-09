import { jwtDecode } from 'jwt-decode';

/**
 * token geçerli mi
 * @returns {boolean}
 */
export const isTokenValid = () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return false;
    }
    
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    if (decodedToken.exp < currentTime) {
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Token validation error:', error);

    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    return false;
  }
};

export const redirectToLogin = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('isAdmin');
  window.location.href = '/login';
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('isAdmin');
  window.location.href = '/login';
};

/**
 * admin kontrol
 * @returns {boolean}
 */
export const isAdmin = () => {
  return localStorage.getItem('isAdmin') === 'true';
}; 