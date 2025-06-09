//Adliye tablosundan getAll
const pool = require('../db');

exports.getAllAdliyeler = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.id, a.adliye_adi, a.aktif, i.il_adi
      FROM adliyeler a
      JOIN iller i ON a.il_id = i.id
      ORDER BY a.adliye_adi
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Adliyeler listesi alınırken hata oluştu' });
  }
};
