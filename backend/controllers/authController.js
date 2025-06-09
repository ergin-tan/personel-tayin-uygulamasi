const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { logUserAction, USER_ACTIONS } = require('../utils/userActionLogger');

exports.login = async (req, res) => {
  const { sicil_no, password } = req.body;
  logger.info(`Giriş denemesi`, { sicil_no });
  
  try {
    const result = await pool.query(
      'SELECT id, password_hash, ad, soyad, unvan, isadmin, isdeleted FROM personel WHERE sicil_no = $1 AND aktif = true',
      [sicil_no]
    );

    const user = result.rows[0];

    if (!user) {
      logger.warn(`Kullanıcı bulunamadı`, { sicil_no });
      return res.status(401).json({ message: 'Sicil numarası veya şifre hatalı.' });
    }
    
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      logger.warn(`Şifre eşleşmiyor`, { 
        userId: user.id, 
        ad: user.ad 
      });
      return res.status(401).json({ message: 'Sicil numarası veya şifre hatalı.' });
    }
    
    if (user.isdeleted) {
      logger.warn(`Silinmiş kullanıcı giriş yapmaya çalıştı`, { 
        userId: user.id, 
        ad: user.ad,
        sicil_no: sicil_no
      });
      return res.status(401).json({ message: 'Bu hesaba erişelemez, lütfen yöneticinizle iletişime geçiniz.' });
    }

    logger.debug(`Kullanıcı bulundu ve şifre eşleşti`, { 
      userId: user.id, 
      ad: user.ad, 
      isAdmin: user.isadmin 
    });

    const token = jwt.sign(
        {
            personel_id: user.id,
            ad: user.ad,
            unvan: user.unvan,
            isAdmin: user.isadmin
        },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
    );

    logUserAction(user.id, USER_ACTIONS.LOGIN, {
      sicil_no,
      ad: user.ad,
      soyad: user.soyad,
      unvan: user.unvan,
      isAdmin: user.isadmin,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.json({
      token,
      isAdmin: user.isadmin,
      personelId: user.id
    });

  } catch (err) {
    logger.error(`Giriş hatası`, { 
      sicil_no, 
      error: err.message, 
      stack: err.stack 
    });
    res.status(500).json({ message: 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.' });
  }
};