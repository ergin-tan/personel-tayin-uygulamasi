const jwt = require('jsonwebtoken');
const pool = require('../db');
const logger = require('../utils/logger');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(403).json({ message: 'Token gerekli' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    const result = await pool.query(
      'SELECT isdeleted FROM personel WHERE id = $1',
      [decoded.personel_id]
    );
    
    if (result.rows.length === 0) {
      logger.warn('Token doğrulandı ancak kullanıcı bulunamadı', { personel_id: decoded.personel_id });
      return res.status(403).json({ message: 'Geçersiz kullanıcı' });
    }
    
    if (result.rows[0].isdeleted) {
      logger.warn('Silinmiş kullanıcı erişim denemesi', { personel_id: decoded.personel_id });
      return res.status(403).json({ message: 'Bu hesaba erişelemez, lütfen yöneticinizle iletişime geçiniz.' });
    }
    
    next();
  } catch (err) {
    logger.error('Token doğrulama hatası', { error: err.message });
    return res.status(403).json({ message: 'Geçersiz token' });
  }
};

module.exports = verifyToken;
