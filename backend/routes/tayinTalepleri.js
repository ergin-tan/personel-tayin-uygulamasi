const express = require('express');
const router = express.Router();
const pool = require('../db');
const verifyToken = require('../middleware/verifyToken');

router.get('/', verifyToken, async (req, res) => {
  const personel_id = req.user.personel_id; 

  try {
    const { rows } = await pool.query(
      `
      SELECT
        tt.*,
        p.ad AS personel_ad,
        p.soyad AS personel_soyad,
        mevcut_adliye.adliye_adi AS mevcut_adliye_adi,
        mevcut_il.il_adi AS mevcut_il_adi,
        talep_adliye.adliye_adi AS talep_adliye_adi,
        talep_il.il_adi AS talep_il_adi
      FROM tayin_talepleri tt
      JOIN personel p ON tt.personel_id = p.id
      JOIN adliyeler mevcut_adliye ON tt.mevcut_adliye_id = mevcut_adliye.id
      JOIN iller mevcut_il ON mevcut_adliye.il_id = mevcut_il.id
      JOIN adliyeler talep_adliye ON tt.talep_adliye_id = talep_adliye.id
      JOIN iller talep_il ON talep_adliye.il_id = talep_il.id
      WHERE tt.personel_id = $1 AND tt.isdeleted = false
      ORDER BY tt.talep_tarihi DESC
      `,
      [personel_id]
    );

    res.json(rows);
  } catch (err) {
    console.error('Tayin talepleri alma hatası:', err);
    res.status(500).json({ message: 'Tayin talepleri alınırken hata oluştu' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  const { tayin_turu, aciklama, talep_adliye_id } = req.body;
  const personel_id = req.user.personel_id;

  console.log('POST /tayin-talepleri: personel_id from token:', personel_id);
  console.log('POST /tayin-talepleri: tayin_turu from req.body:', tayin_turu);
  console.log('POST /tayin-talepleri: talep_adliye_id from req.body:', talep_adliye_id);

  if (!personel_id || !tayin_turu || !talep_adliye_id) {
    let missingField = '';
    if (!personel_id) missingField = 'personel_id (tokendan gelmiyor olabilir)';
    else if (!tayin_turu) missingField = 'tayin_turu (istek gövdesinde eksik)';
    else if (!talep_adliye_id) missingField = 'talep_adliye_id (istek gövdesinde eksik)';

    console.error(`Eksik bilgi hatası: ${missingField}. Gelen veriler: personel_id=${personel_id}, tayin_turu=${tayin_turu}, talep_adliye_id=${talep_adliye_id}`);
    return res.status(400).json({ message: `Eksik bilgi: ${missingField}` });
  }

  const MAX_ACIKLAMA_LENGTH = 300;
  if (aciklama && aciklama.length > MAX_ACIKLAMA_LENGTH) {
    return res.status(400).json({ 
      message: `Açıklama alanı en fazla ${MAX_ACIKLAMA_LENGTH} karakter olabilir.` 
    });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (['ogrenim', 'esdurumu', 'saglik'].includes(tayin_turu.toLowerCase())) {
      const existingRequestResult = await client.query(
        `SELECT id FROM tayin_talepleri 
         WHERE personel_id = $1 
         AND tayin_turu = $2 
         AND durum IN ('beklemede', 'inceleme')
         AND isdeleted = false`,
        [personel_id, tayin_turu.toLowerCase()]
      );

      if (existingRequestResult.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          message: `${tayin_turu} türünde bekleyen veya incelemede olan bir tayin talebiniz zaten var. Yeni talep oluşturamazsınız.`
        });
      }
    }

    const currentAdliyeResult = await client.query(
      `SELECT mevcut_adliye_id FROM personel WHERE id = $1`,
      [personel_id]
    );

    if (currentAdliyeResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Personel bulunamadı' });
    }

    const mevcut_adliye_id_at_request = currentAdliyeResult.rows[0].mevcut_adliye_id;

    if (parseInt(mevcut_adliye_id_at_request) === parseInt(talep_adliye_id)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        message: 'Bulunduğunuz adliyeye tayin talebinde bulunamazsınız.'
      });
    }

    const now = new Date();

    const { rows } = await client.query(
      `
      INSERT INTO tayin_talepleri
        (created_at, updated_at, talep_tarihi, personel_id, tayin_turu, aciklama, durum, mevcut_adliye_id, talep_adliye_id)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
      `,
      [
        now, //created_at
        now, //updated_at
        now, //talep_tarihi
        personel_id,
        tayin_turu.toLowerCase(),
        aciklama || '',
        'beklemede', //default
        mevcut_adliye_id_at_request,
        talep_adliye_id
      ]
    );

    await client.query('COMMIT');
    res.status(201).json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Tayin talebi ekleme hatası:', err);
    res.status(500).json({ message: 'Tayin talebi oluşturulurken hata oluştu' });
  } finally {
    client.release();
  }
});

router.put('/:id/iptal', verifyToken, async (req, res) => {
  const { id } = req.params;
  const personel_id = req.user.personel_id;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const talepResult = await client.query(
      'SELECT durum, personel_id FROM tayin_talepleri WHERE id = $1',
      [id]
    );

    if (talepResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Tayin talebi bulunamadı.' });
    }

    const talep = talepResult.rows[0];

    if (talep.personel_id !== personel_id) {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: 'Bu tayin talebini iptal etme yetkiniz yok.' });
    }

    if (talep.durum !== 'beklemede') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Sadece beklemede olan talepler iptal edilebilir.' });
    }

    const now = new Date();
    await client.query(
      `
      UPDATE tayin_talepleri
      SET durum = 'iptal',
          karar_tarihi = $1,
          karar_aciklamasi = 'Personel tarafından iptal edildi.',
          updated_at = $1
      WHERE id = $2
      `,
      [now, id]
    );

    await client.query('COMMIT');
    res.json({ message: 'Tayin talebi başarıyla iptal edildi.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Tayin talebi iptal hatası:', err);
    res.status(500).json({ message: 'Tayin talebi iptal edilirken bir hata oluştu.' });
  } finally {
    client.release();
  }
});

module.exports = router;