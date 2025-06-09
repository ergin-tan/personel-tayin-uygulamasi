const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const logger = require('../utils/logger');
const { logUserAction, USER_ACTIONS } = require('../utils/userActionLogger');
const { validatePassword } = require('../utils/passwordUtils');
const { validateEmail, validatePhone } = require('../utils/validationUtils');

const createPersonel = async (req, res) => {
  const {
    tc_kimlik_no, sicil_no, password,
    ad, soyad, email, telefon,
    unvan, mevcut_adliye_id, aktif
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const now = new Date();

    const result = await pool.query(`
      INSERT INTO personel
      (tc_kimlik_no, sicil_no, password_hash, ad, soyad, email, telefon, unvan, mevcut_adliye_id, aktif, created_at, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [tc_kimlik_no, sicil_no, hashedPassword, ad, soyad, email, telefon, unvan, mevcut_adliye_id, aktif, now, now]
    );

    const personel = result.rows[0];

    const token = jwt.sign(
      {
        personel_id: personel.id,
        ad: personel.ad,
        unvan: personel.unvan,
        sicil_no: personel.sicil_no
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    if (req.user && req.user.isAdmin) {
      logUserAction(req.user.personel_id, USER_ACTIONS.ADMIN_CREATE_USER, {
        created_user_id: personel.id,
        sicil_no: personel.sicil_no,
        ad: personel.ad,
        soyad: personel.soyad,
        unvan: personel.unvan
      }, personel.id);
    }

    res.status(201).json({ token, personel });
  } catch (err) {
    logger.error('Personel oluşturma hatası', {
      error: err.message,
      stack: err.stack,
      request_body: req.body
    }, req.user?.personel_id);
    res.status(500).send('Kayıt sırasında hata oluştu');
  }
};

//Personel tablosundan getAll
const getAll = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM personel');
    logger.debug('Tüm personel listesi çekildi', {
      count: result.rows.length
    }, req.user?.personel_id);
    res.json(result.rows);
  } catch (err) {
    logger.error('Personel listesi çekme hatası', {
      error: err.message,
      stack: err.stack
    }, req.user?.personel_id);
    res.status(500).send('Veri çekilirken hata oluştu');
  }
};

const getMe = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id,
        p.tc_kimlik_no,
        p.sicil_no,
        p.ad,
        p.soyad,
        p.email,
        p.telefon,
        p.unvan,
        p.mevcut_adliye_id,
        a.adliye_adi AS mevcut_adliye_adi,
        i.il_adi AS mevcut_il_adi,
        p.ise_baslama_tarihi,
        p.mevcut_gorevde_baslama_tarihi,
        p.aktif,
        p.created_at,
        p.updated_at
      FROM personel p
      JOIN adliyeler a ON p.mevcut_adliye_id = a.id
      JOIN iller i ON a.il_id = i.id
      WHERE p.id = $1
    `, [req.user.personel_id]);

    if (result.rows.length === 0) {
      logger.warn('Kullanıcı bilgisi bulunamadı', {
        personel_id: req.user.personel_id
      }, req.user.personel_id);
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    logger.debug('Kullanıcı kendi bilgilerini görüntüledi', {
      personel_id: req.user.personel_id
    }, req.user.personel_id);
    res.json(result.rows[0]);
  } catch (err) {
    logger.error('Kullanıcı bilgisi alma hatası', {
      error: err.message,
      stack: err.stack,
      personel_id: req.user.personel_id
    }, req.user.personel_id);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

const updateProfile = async (req, res) => {
  const personel_id = req.user.personel_id;
  const { password, email, telefon } = req.body;

  if (!password && !email && !telefon) {
    logger.warn('Profil güncelleme: Hiçbir alan gönderilmedi', {}, personel_id);
    return res.status(400).json({ message: 'En az bir alan güncellenmeli' });
  }

  try {
    let password_hash;
    if (password && password.trim() !== '') {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        logger.warn('Profil güncelleme: Şifre gereksinimleri karşılanmıyor', {
          message: passwordValidation.message
        }, personel_id);
        return res.status(400).json({ 
          message: 'Şifre gereksinimleri karşılanmıyor: ' + passwordValidation.message 
        });
      }

      const saltRounds = 10;
      password_hash = await bcrypt.hash(password, saltRounds);
    }

    if (email && email.trim() !== '') {
      const emailValidation = validateEmail(email.trim());
      console.log('Backend email validation for:', email.trim(), 'Result:', emailValidation);
      if (!emailValidation.isValid) {
        logger.warn('Profil güncelleme: Email formatı geçersiz', {
          email: email.trim(),
          message: emailValidation.message
        }, personel_id);
        return res.status(400).json({ 
          message: 'Email formatı geçersiz: ' + emailValidation.message 
        });
      }
    }

    if (telefon && telefon.trim() !== '') {
      const phoneValidation = validatePhone(telefon);
      if (!phoneValidation.isValid) {
        logger.warn('Profil güncelleme: Telefon formatı geçersiz', {
          telefon: telefon,
          message: phoneValidation.message
        }, personel_id);
        return res.status(400).json({ 
          message: 'Telefon formatı geçersiz: ' + phoneValidation.message 
        });
      }
    }

    const fields = [];
    const values = [];
    let idx = 1;

    const updatedFields = {};

    if (password_hash) {
      fields.push(`password_hash = $${idx++}`);
      values.push(password_hash);
      updatedFields.password_changed = true;
    }
    
    if (email && email.trim() !== '') {
      fields.push(`email = $${idx++}`);
      values.push(email.trim());
      updatedFields.email = email.trim();
    }
    
    if (telefon && telefon.trim() !== '') {
      fields.push(`telefon = $${idx++}`);
      values.push(telefon.trim());
      updatedFields.telefon = telefon.trim();
    }

    if (fields.length === 0) {
      logger.warn('Profil güncelleme: Güncellenecek alan bulunamadı', {}, personel_id);
      return res.status(400).json({ message: 'Güncellenecek alan bulunamadı' });
    }

    fields.push(`updated_at = NOW()`);

    const query = `
      UPDATE personel
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING id, ad, soyad, email, telefon, updated_at
    `;

    values.push(personel_id);

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      logger.warn('Profil güncelleme: Personel bulunamadı', {
        personel_id
      }, personel_id);
      return res.status(404).json({ message: 'Personel bulunamadı' });
    }

    logUserAction(personel_id, USER_ACTIONS.PROFILE_UPDATE, {
      updated_fields: Object.keys(updatedFields),
      ...updatedFields
    });

    logger.info('Profil güncellendi', {
      personel_id,
      updated_fields: Object.keys(updatedFields)
    }, personel_id);

    return res.json({
      message: 'Profil başarıyla güncellendi',
      updatedFields: Object.keys(updatedFields),
      personel: result.rows[0]
    });
  } catch (err) {
    logger.error('Profil güncelleme hatası', {
      error: err.message,
      stack: err.stack
    }, personel_id);
    
    if (err.message && err.message.includes('duplicate key value violates unique constraint "personel_email_key"')) {
      return res.status(400).json({ 
        message: 'Bu email adresi başka bir kullanıcı tarafından kullanılıyor. Lütfen başka bir email adresi seçin.' 
      });
    }
    
    return res.status(500).json({ message: 'Profil güncellenirken bir hata oluştu' });
  }
};

module.exports = {
  createPersonel,
  getAll,
  getMe,
  updateProfile
};
