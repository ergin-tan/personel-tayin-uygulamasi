const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');

//log dizin
const logDirectory = path.join(__dirname, '../logs');

if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

/**
 * Loglama fonksiyonu
 * @param {string} level
 * @param {string} message
 * @param {Object} data
 * @param {string} userId 
 */

const log = (level, message, data = {}, userId = null) => {
  const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
  
  const logEntry = {
    timestamp,
    level,
    message,
    userId,
    ...data
  };
  
  console.log(`[${timestamp}] [${level}] ${message}`);
  if (Object.keys(data).length > 0) {
    console.log('Data:', JSON.stringify(data, null, 2));
  }
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const logFile = path.join(logDirectory, `${today}.log`);
  
  fs.appendFile(
    logFile, 
    `${JSON.stringify(logEntry)}\n`, 
    (err) => {
      if (err) {
        console.error('Log dosyasına yazılamadı:', err);
      }
    }
  );
};

const error = (message, data = {}, userId = null) => log(LOG_LEVELS.ERROR, message, data, userId);
const warn = (message, data = {}, userId = null) => log(LOG_LEVELS.WARN, message, data, userId);
const info = (message, data = {}, userId = null) => log(LOG_LEVELS.INFO, message, data, userId);
const debug = (message, data = {}, userId = null) => log(LOG_LEVELS.DEBUG, message, data, userId);

const logUserAction = (userId, action, details = {}) => {
  info(`Kullanıcı İşlemi: ${action}`, details, userId);
};

module.exports = {
  error,
  warn,
  info,
  debug,
  logUserAction,
  LOG_LEVELS
}; 