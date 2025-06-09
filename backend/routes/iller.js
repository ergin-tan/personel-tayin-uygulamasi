const express = require('express');
const router = express.Router();
const { getAllIller } = require('../controllers/illerController');
const pool = require('../db');

router.get('/', getAllIller);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM iller ORDER BY il_adi');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('İller alınırken hata oluştu');
  }
});

module.exports = router;
