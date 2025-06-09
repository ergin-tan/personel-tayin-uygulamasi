const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {

  const start = new Date();
  const { method, originalUrl, ip } = req;
  

  logger.info(`Gelen İstek: ${method} ${originalUrl}`, { 
    ip, 
    userAgent: req.headers['user-agent'],
    requestBody: method !== 'GET' ? req.body : undefined
  }, req.user?.personel_id);
  
  const originalEnd = res.end;
  
  res.end = function(chunk, encoding) {

    originalEnd.call(this, chunk, encoding);
    

    const duration = new Date() - start;
    
    logger.info(`Yanıt: ${method} ${originalUrl} - ${res.statusCode}`, {
      duration: `${duration}ms`,
      contentLength: res.getHeader('content-length'),
      ip
    }, req.user?.personel_id);
  };
  
  next();
};

module.exports = requestLogger; 