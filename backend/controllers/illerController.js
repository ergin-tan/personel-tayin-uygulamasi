//İl tablosundan getAll
const pool = require('../db');

exports.getAllIller = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM iller ORDER BY il_adi');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'İller listesi alınırken hata oluştu' });
  }
};