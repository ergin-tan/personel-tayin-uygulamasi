const logger = require('./logger');

const USER_ACTIONS = {
  LOGIN: 'Giriş Yapma',
  LOGOUT: 'Çıkış Yapma',
  PASSWORD_CHANGE: 'Şifre Değiştirme',
  PROFILE_UPDATE: 'Profil Güncelleme',
  CREATE_REQUEST: 'Tayin Talebi Oluşturma',
  UPDATE_REQUEST: 'Tayin Talebi Güncelleme',
  DELETE_REQUEST: 'Tayin Talebi Silme',
  ADMIN_CREATE_USER: 'Kullanıcı Oluşturma (Admin)',
  ADMIN_UPDATE_USER: 'Kullanıcı Güncelleme (Admin)',
  ADMIN_DELETE_USER: 'Kullanıcı Silme (Admin)',
  ADMIN_UPDATE_REQUEST: 'Tayin Talebi Güncelleme (Admin)'
};

/**
 * Kullanıcı işlemlerini loglamak için yardımcı fonksiyon
 * @param {string} userId
 * @param {string} action
 * @param {Object} details 
 * @param {string} targetUserId
 */
const logUserAction = (userId, action, details = {}, targetUserId = null) => {
  const logDetails = {
    ...details,
    ...(targetUserId && { targetUserId })
  };
  
  logger.info(`Kullanıcı İşlemi: ${action}`, logDetails, userId);
};

module.exports = {
  logUserAction,
  USER_ACTIONS
}; 