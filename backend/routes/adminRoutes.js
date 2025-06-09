const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');
const verifyAdmin = require('../middleware/verifyAdmin');
const { validatePassword } = require('../utils/passwordUtils');
const { validateEmail, validatePhone } = require('../utils/validationUtils');

router.use(authenticateToken);
router.use(isAdmin);

router.get('/personel/check-duplicate', async (req, res) => {
  const { field, value } = req.query;
  
  if (!field || !value) {
    return res.status(400).json({ message: 'Field ve value parametreleri gereklidir.' });
  }
  
  if (field !== 'tc_kimlik_no' && field !== 'sicil_no') {
    return res.status(400).json({ message: 'Geçersiz field parametresi. Kabul edilen değerler: tc_kimlik_no, sicil_no' });
  }
  
  try {
    const query = `SELECT id FROM personel WHERE ${field} = $1`;
    const result = await pool.query(query, [value]);
    
    res.json({
      exists: result.rows.length > 0,
      field: field
    });
  } catch (err) {
    console.error(`${field} kontrolü sırasında hata:`, err.message);
    res.status(500).json({ message: 'Kontrol sırasında bir hata oluştu.' });
  }
});

router.get('/personel', async (req, res) => {
  const { includeDeleted } = req.query;
  try {
    let query = `
      SELECT
        p.id, p.tc_kimlik_no, p.sicil_no, p.ad, p.soyad, p.email, p.telefon,
        p.unvan, p.aktif, p.isadmin, p.ise_baslama_tarihi, p.mevcut_gorevde_baslama_tarihi,
        p.isdeleted, p.mevcut_adliye_id, p.created_at, p.updated_at
      FROM personel p
    `;
    
    if (includeDeleted !== 'true') {
      query += ` WHERE (p.isdeleted = false OR p.isdeleted IS NULL) `;
    }
    
    query += ` ORDER BY p.ad, p.soyad`;
    
    const personelList = await pool.query(query);
    res.json(personelList.rows);
  } catch (err) {
    console.error('Personel listesi alınırken hata:', err.message);
    res.status(500).json({ message: 'Personel listesi alınamadı.' });
  }
});

router.post('/personel', verifyAdmin, async (req, res) => {
  const {
    tc_kimlik_no, sicil_no, password, ad, soyad, email, telefon,
    unvan, mevcut_adliye_id, isAdmin, aktif,
    ise_baslama_tarihi, mevcut_gorevde_baslama_tarihi
  } = req.body;

  if (!tc_kimlik_no || !sicil_no || !password || !ad || !soyad || !unvan || !mevcut_adliye_id) {
    return res.status(400).json({ message: 'Zorunlu alanlar eksik.' });
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return res.status(400).json({ 
      message: 'Şifre gereksinimleri karşılanmıyor: ' + passwordValidation.message 
    });
  }
  
  if (email && email.trim() !== '') {
    const emailValidation = validateEmail(email.trim());
    if (!emailValidation.isValid) {
      return res.status(400).json({ 
        message: 'Email formatı geçersiz: ' + emailValidation.message 
      });
    }
  }
  
  if (telefon && telefon.trim() !== '') {
    const phoneValidation = validatePhone(telefon.trim());
    if (!phoneValidation.isValid) {
      return res.status(400).json({ 
        message: 'Telefon formatı geçersiz: ' + phoneValidation.message 
      });
    }
  }

  const today = new Date();
  const turkeyTime = new Date(today.getTime() + (3 * 60 * 60 * 1000));
  const todayStr = turkeyTime.toISOString().split('T')[0];
  
  if (ise_baslama_tarihi && ise_baslama_tarihi > todayStr) {
    return res.status(400).json({ 
      message: 'İşe başlama tarihi gelecek bir tarih olamaz'
    });
  }
  
  if (mevcut_gorevde_baslama_tarihi && mevcut_gorevde_baslama_tarihi > todayStr) {
    return res.status(400).json({ 
      message: 'Mevcut görevde başlama tarihi gelecek bir tarih olamaz'
    });
  }

  try {
    const tcCheck = await pool.query('SELECT id FROM personel WHERE tc_kimlik_no = $1', [tc_kimlik_no]);
    if (tcCheck.rows.length > 0) {
      return res.status(409).json({ 
        message: 'Bu TC Kimlik No ile kayıtlı bir personel zaten var.',
        error: 'duplicate_key',
        field: 'tc_kimlik_no'
      });
    }

    const sicilCheck = await pool.query('SELECT id FROM personel WHERE sicil_no = $1', [sicil_no]);
    if (sicilCheck.rows.length > 0) {
      return res.status(409).json({ 
        message: 'Bu Sicil No ile kayıtlı bir personel zaten var.',
        error: 'duplicate_key',
        field: 'sicil_no'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(`
      INSERT INTO personel (
        tc_kimlik_no, sicil_no, password_hash, ad, soyad, email, telefon,
        unvan, mevcut_adliye_id, isadmin, aktif,
        ise_baslama_tarihi, mevcut_gorevde_baslama_tarihi,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()) RETURNING *`,
      [
        tc_kimlik_no, sicil_no, hashedPassword, ad, soyad, email, telefon,
        unvan, mevcut_adliye_id, isAdmin || false, aktif !== undefined ? aktif : true,
        ise_baslama_tarihi, mevcut_gorevde_baslama_tarihi
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Personel oluşturma hatası:', err);
    res.status(500).json({ message: 'Personel oluşturulurken bir hata oluştu.' });
  }
});

router.put('/personel/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const {
    tc_kimlik_no, sicil_no, password, ad, soyad, email, telefon, unvan,
    mevcut_adliye_id, isAdmin, aktif,
    ise_baslama_tarihi, mevcut_gorevde_baslama_tarihi
  } = req.body;
  
  try {
    if (password) {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({ 
          message: 'Şifre gereksinimleri karşılanmıyor: ' + passwordValidation.message 
        });
      }
    }
    
    if (email && email.trim() !== '') {
      const emailValidation = validateEmail(email.trim());
      if (!emailValidation.isValid) {
        return res.status(400).json({ 
          message: 'Email formatı geçersiz: ' + emailValidation.message 
        });
      }
    }
    
    if (telefon && telefon.trim() !== '') {
      const phoneValidation = validatePhone(telefon);
      if (!phoneValidation.isValid) {
        return res.status(400).json({ 
          message: 'Telefon formatı geçersiz: ' + phoneValidation.message 
        });
      }
    }
    
    const today = new Date();
    const turkeyTime = new Date(today.getTime() + (3 * 60 * 60 * 1000));
    const todayStr = turkeyTime.toISOString().split('T')[0];
    
    if (ise_baslama_tarihi && ise_baslama_tarihi > todayStr) {
      return res.status(400).json({ 
        message: 'İşe başlama tarihi gelecek bir tarih olamaz'
      });
    }
    
    if (mevcut_gorevde_baslama_tarihi && mevcut_gorevde_baslama_tarihi > todayStr) {
      return res.status(400).json({ 
        message: 'Mevcut görevde başlama tarihi gelecek bir tarih olamaz'
      });
    }
    
    let updateQuery = `
      UPDATE personel SET
        tc_kimlik_no = $1, sicil_no = $2, ad = $3, soyad = $4, email = $5,
        telefon = $6, unvan = $7, mevcut_adliye_id = $8, isadmin = $9,
        aktif = $10, ise_baslama_tarihi = $11, mevcut_gorevde_baslama_tarihi = $12,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $13 RETURNING *
    `;
    const params = [
      tc_kimlik_no, sicil_no, ad, soyad, email, telefon, unvan,
      mevcut_adliye_id, isAdmin, aktif,
      ise_baslama_tarihi, mevcut_gorevde_baslama_tarihi,
      id
    ];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery = `
        UPDATE personel SET
          tc_kimlik_no = $1, sicil_no = $2, password_hash = $3, ad = $4, soyad = $5, email = $6,
          telefon = $7, unvan = $8, mevcut_adliye_id = $9, isadmin = $10,
          aktif = $11, ise_baslama_tarihi = $12, mevcut_gorevde_baslama_tarihi = $13,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $14 RETURNING *
      `;
      params.splice(2, 0, hashedPassword);
    }

    const updatedPersonel = await pool.query(updateQuery, params);

    if (updatedPersonel.rows.length === 0) {
      return res.status(404).json({ message: 'Personel bulunamadı.' });
    }
    res.json(updatedPersonel.rows[0]);
  } catch (err) {
    console.error('Personel güncelleme hatası:', err);
    res.status(500).json({ message: 'Personel güncellenirken bir hata oluştu.' });
  }
});

router.delete('/personel/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const updateOp = await pool.query(
      'UPDATE personel SET isdeleted = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id', 
      [id]
    );
    if (updateOp.rows.length === 0) {
      return res.status(404).json({ message: 'Personel bulunamadı.' });
    }
    res.json({ message: 'Personel başarıyla silindi.' });
  } catch (err) {
    console.error('Personel silerken hata:', err.message);
    res.status(500).json({ message: 'Personel silinirken sunucu hatası.' });
  }
});

router.get('/adliyeler/:adliyeId/personel', async (req, res) => {
  const { adliyeId } = req.params;
  const { includeDeleted } = req.query;
  try {
    let query = `
      SELECT
        p.id, p.tc_kimlik_no, p.sicil_no, p.ad, p.soyad, p.email, p.telefon,
        p.unvan, p.aktif, p.isadmin, p.ise_baslama_tarihi, p.mevcut_gorevde_baslama_tarihi,
        p.isdeleted
      FROM personel p
      WHERE p.mevcut_adliye_id = $1
    `;
    
    if (includeDeleted !== 'true') {
      query += ` AND (p.isdeleted = false OR p.isdeleted IS NULL) `;
    }
    
    query += ` ORDER BY p.ad, p.soyad`;
    
    const personelList = await pool.query(query, [adliyeId]);
    
    res.json(personelList.rows);
  } catch (err) {
    console.error('Adliyeye göre personel listesi alınırken hata:', err.message);
    res.status(500).json({ message: 'Personel listesi alınamadı.' });
  }
});


//tüm tayin talepleri getall
router.get('/tayin-talepleri', async (req, res) => {
  const { includeDeleted } = req.query;
  try {
    let query = `
      SELECT
        tt.id, tt.personel_id, tt.tayin_turu, tt.aciklama, tt.durum,
        tt.talep_tarihi, tt.karar_tarihi, tt.karar_aciklamasi,
        tt.talep_adliye_id, tt.mevcut_adliye_id, tt.isdeleted,
        p.ad as personel_ad, p.soyad as personel_soyad, p.sicil_no,
        ta.adliye_adi as talep_edilen_adliye_adi,
        orig_adliye.adliye_adi as talep_anindaki_mevcut_adliye_adi,
        pa.adliye_adi as personel_mevcut_adliye_adi
      FROM tayin_talepleri tt
      JOIN personel p ON tt.personel_id = p.id
      JOIN adliyeler ta ON tt.talep_adliye_id = ta.id
      JOIN adliyeler orig_adliye ON tt.mevcut_adliye_id = orig_adliye.id
      LEFT JOIN adliyeler pa ON p.mevcut_adliye_id = pa.id
    `;
    
    if (includeDeleted !== 'true') {
      query += ` WHERE (tt.isdeleted = false OR tt.isdeleted IS NULL) `;
    }
    
    query += ` ORDER BY tt.talep_tarihi DESC`;
    
    const tayinTalepleri = await pool.query(query);
    res.json(tayinTalepleri.rows);
  } catch (err) {
    console.error('Tayin talepleri alınırken hata:', err.message);
    res.status(500).json({ message: 'Tayin talepleri alınamadı.' });
  }
});

//tayin talebi durum güncelleme
router.put('/tayin-talepleri/:id', async (req, res) => {
  const { id } = req.params;
  const { durum, karar_aciklamasi } = req.body;

  const validDurumlar = ['beklemede', 'inceleme', 'onaylandi', 'reddedildi', 'iptal'];
  if (!validDurumlar.includes(durum)) {
    return res.status(400).json({ message: `Geçersiz talep durumu: "${durum}". Geçerli değerler: ${validDurumlar.join(', ')}` });
  }

  if ((durum === 'onaylandi' || durum === 'reddedildi') && (!karar_aciklamasi || karar_aciklamasi.trim() === '')) {
    return res.status(400).json({ message: `${durum === 'onaylandi' ? 'Onaylanan' : 'Reddedilen'} talepler için karar açıklaması zorunludur.` });
  }

  const MAX_ACIKLAMA_LENGTH = 300;
  if (karar_aciklamasi && karar_aciklamasi.length > MAX_ACIKLAMA_LENGTH) {
    return res.status(400).json({ 
      message: `Karar açıklaması en fazla ${MAX_ACIKLAMA_LENGTH} karakter olabilir.` 
    });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const talepQuery = await client.query(
      'SELECT personel_id, talep_adliye_id, mevcut_adliye_id FROM tayin_talepleri WHERE id = $1',
      [id]
    );

    if (talepQuery.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Tayin talebi bulunamadı.' });
    }

    const { personel_id, talep_adliye_id } = talepQuery.rows[0];
    let kararTarihiValue = null;
    let kararAciklamasiValue = null;

    if (durum === 'onaylandi' || durum === 'reddedildi') {
      kararTarihiValue = new Date();
      kararAciklamasiValue = karar_aciklamasi;
    } else if (durum === 'iptal') {
      kararTarihiValue = new Date();
      kararAciklamasiValue = 'Yönetici tarafından iptal edildi.';
    }

    const updateQuery = `
      UPDATE tayin_talepleri SET
          durum = $1,
          karar_aciklamasi = $2,
          karar_tarihi = $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 RETURNING *
    `;
    const params = [durum, kararAciklamasiValue, kararTarihiValue, id];

    const updatedTalep = await client.query(updateQuery, params);

    //onaylanınca adliye güncelleme
    if (durum === 'onaylandi') {
      await client.query(
        `UPDATE personel 
         SET mevcut_adliye_id = $1, 
             mevcut_gorevde_baslama_tarihi = $2,
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = $3`,
        [talep_adliye_id, kararTarihiValue, personel_id]
      );
      console.log(`Personel ${personel_id} adliyesi ${talep_adliye_id} olarak güncellendi.`);
    }

    await client.query('COMMIT');

    const updatedTalepWithDetails = await client.query(`
      SELECT
        tt.id, tt.personel_id, tt.tayin_turu, tt.aciklama, tt.durum,
        tt.talep_tarihi, tt.karar_tarihi, tt.karar_aciklamasi,
        tt.talep_adliye_id, tt.mevcut_adliye_id,
        p.ad as personel_ad, p.soyad as personel_soyad, p.sicil_no,
        ta.adliye_adi as talep_edilen_adliye_adi,
        orig_adliye.adliye_adi as talep_anindaki_mevcut_adliye_adi,
        pa.adliye_adi as personel_mevcut_adliye_adi
      FROM tayin_talepleri tt
      JOIN personel p ON tt.personel_id = p.id
      JOIN adliyeler ta ON tt.talep_adliye_id = ta.id
      JOIN adliyeler orig_adliye ON tt.mevcut_adliye_id = orig_adliye.id
      LEFT JOIN adliyeler pa ON p.mevcut_adliye_id = pa.id
      WHERE tt.id = $1
    `, [id]);

    res.json(updatedTalepWithDetails.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Tayin talebi güncellerken hata:', err.message);
    res.status(500).json({ message: 'Tayin talebi güncellenirken sunucu hatası.' });
  } finally {
    client.release();
  }
});

//tayin talebi delete
router.delete('/tayin-talepleri/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const updateOp = await pool.query(
      'UPDATE tayin_talepleri SET isdeleted = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id', 
      [id]
    );
    if (updateOp.rows.length === 0) {
      return res.status(404).json({ message: 'Tayin talebi bulunamadı.' });
    }
    res.json({ message: 'Tayin talebi başarıyla silindi.' });
  } catch (err) {
      console.error('Tayin talebi silerken hata:', err.message);
      res.status(500).json({ message: 'Tayin talebi silinirken sunucu hatası.' });
  }
});

//admin şifre sıfırlama
router.post('/reset-password', verifyAdmin, async (req, res) => {
  const { personel_id, new_password } = req.body;

  if (!personel_id || !new_password) {
    return res.status(400).json({ message: 'Personel ID ve yeni şifre gereklidir' });
  }
  
  const passwordValidation = validatePassword(new_password);
  if (!passwordValidation.isValid) {
    return res.status(400).json({ 
      message: 'Şifre gereksinimleri karşılanmıyor: ' + passwordValidation.message 
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(new_password, 10);

    const result = await pool.query(
      'UPDATE personel SET password_hash = $1, updated_at = NOW() WHERE id = $2 RETURNING id, ad, soyad',
      [hashedPassword, personel_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Personel bulunamadı' });
    }

    res.json({ 
      message: 'Şifre başarıyla sıfırlandı', 
      personel: result.rows[0] 
    });
  } catch (err) {
    console.error('Şifre sıfırlama hatası:', err);
    res.status(500).json({ message: 'Şifre sıfırlanırken hata oluştu' });
  }
});

router.get('/logs', async (req, res) => {
    try {
        const logDirectory = path.join(__dirname, '../logs');
        
        if (!fs.existsSync(logDirectory)) {
            fs.mkdirSync(logDirectory, { recursive: true });
            return res.json({ files: [] });
        }
        
        fs.readdir(logDirectory, (err, files) => {
            if (err) {
                console.error('Log dosyaları listelenirken hata:', err);
                return res.status(500).json({ message: 'Log dosyaları listelenirken hata oluştu' });
            }
            
            const logFiles = files.filter(file => file.endsWith('.log'))
                .map(file => ({
                    filename: file,
                    date: file.replace('.log', ''),
                    path: `/api/admin/logs/${file}`
                }))
                .sort((a, b) => new Date(b.date) - new Date(a.date));
            
            res.json({ files: logFiles });
        });
    } catch (err) {
        console.error('Log dosyaları listelenirken hata:', err);
        res.status(500).json({ message: 'Log dosyaları listelenirken hata oluştu' });
    }
});

router.get('/logs/today', async (req, res) => {
    try {
        const today = format(new Date(), 'yyyy-MM-dd');
        const logFilePath = path.join(__dirname, '../logs', `${today}.log`);
        
        if (!fs.existsSync(logFilePath)) {
            return res.json({ filename: `${today}.log`, logs: [] });
        }
        
        fs.readFile(logFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Log dosyası okunurken hata:', err);
                return res.status(500).json({ message: 'Log dosyası okunurken hata oluştu' });
            }
            
            const lines = data.trim().split('\n');
            const logs = lines.map(line => {
                try {
                    return JSON.parse(line);
                } catch (e) {
                    return { raw: line, error: 'JSON parse hatası' };
                }
            });
            
            res.json({ filename: `${today}.log`, logs });
        });
    } catch (err) {
        console.error('Log dosyası okunurken hata:', err);
        res.status(500).json({ message: 'Log dosyası okunurken hata oluştu' });
    }
});

router.get('/logs/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const { page = 1, limit = 0 } = req.query;
        const pageNumber = parseInt(page, 10) || 1;
        const pageSize = parseInt(limit, 10) || 0;
        
        const logFilePath = path.join(__dirname, '../logs', filename);
        
        if (!fs.existsSync(logFilePath)) {
            return res.status(404).json({ message: 'Log dosyası bulunamadı' });
        }
        
        fs.readFile(logFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Log dosyası okunurken hata:', err);
                return res.status(500).json({ message: 'Log dosyası okunurken hata oluştu' });
            }
            
            const lines = data.trim().split('\n');
            const allLogs = lines.map(line => {
                try {
                    return JSON.parse(line);
                } catch (e) {
                    return { raw: line, error: 'JSON parse hatası' };
                }
            });
            
            const totalLogs = allLogs.length;
            const logs = pageSize > 0 
                ? allLogs.slice((pageNumber - 1) * pageSize, pageNumber * pageSize) 
                : allLogs;
            
            res.json({ 
                filename, 
                logs,
                pagination: {
                    total: totalLogs,
                    page: pageNumber,
                    limit: pageSize,
                    pages: pageSize > 0 ? Math.ceil(totalLogs / pageSize) : 1
                }
            });
        });
    } catch (err) {
        console.error('Log dosyası okunurken hata:', err);
        res.status(500).json({ message: 'Log dosyası okunurken hata oluştu' });
    }
});

router.put('/personel/:id/restore', async (req, res) => {
  const { id } = req.params;
  try {
    const updateOp = await pool.query(
      'UPDATE personel SET isdeleted = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id', 
      [id]
    );
    if (updateOp.rows.length === 0) {
      return res.status(404).json({ message: 'Personel bulunamadı.' });
    }
    res.json({ message: 'Personel başarıyla geri yüklendi.' });
  } catch (err) {
    console.error('Personel geri yükleme hatası:', err.message);
    res.status(500).json({ message: 'Personel geri yüklenirken sunucu hatası.' });
  }
});

router.put('/tayin-talepleri/:id/restore', async (req, res) => {
  const { id } = req.params;
  try {
    const updateOp = await pool.query(
      'UPDATE tayin_talepleri SET isdeleted = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id', 
      [id]
    );
    if (updateOp.rows.length === 0) {
      return res.status(404).json({ message: 'Tayin talebi bulunamadı.' });
    }
    res.json({ message: 'Tayin talebi başarıyla geri yüklendi.' });
  } catch (err) {
    console.error('Tayin talebi geri yükleme hatası:', err.message);
    res.status(500).json({ message: 'Tayin talebi geri yüklenirken sunucu hatası.' });
  }
});

module.exports = router;