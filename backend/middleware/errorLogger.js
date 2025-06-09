const logger = require('../utils/logger');

const errorLogger = (err, req, res, next) => {
  const { method, originalUrl, ip } = req;
  
  logger.error(`Hata: ${method} ${originalUrl} - ${err.message}`, {
    ip,
    stack: err.stack,
    statusCode: err.statusCode || 500,
    name: err.name
  }, req.user?.personel_id);
  
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Sunucu hatası',
    statusCode
  });
};

module.exports = errorLogger; 