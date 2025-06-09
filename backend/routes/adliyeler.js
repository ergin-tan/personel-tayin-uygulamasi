const express = require('express');
const router = express.Router();
const pool = require('../db');
const verifyToken = require('../middleware/verifyToken');

router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, adliye_adi FROM adliyeler ORDER BY adliye_adi');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Adliyeler alınırken hata oluştu');
  }
});

module.exports = router;
