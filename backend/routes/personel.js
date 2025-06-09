const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const personelController = require('../controllers/personelController');
const pool = require('../db');

router.post('/', personelController.createPersonel);
router.get('/', verifyToken, personelController.getAll);
router.get('/me', verifyToken, personelController.getMe);
router.put('/me', verifyToken, personelController.updateProfile);

router.get('/unvanlar/list', async (req, res) => {
  try {
    const unvanlar = ['yaziislerimuduru', 'zabitkatibi', 'mubasir', 'diger'];
    res.json(unvanlar);
  } catch (err) {
    console.error('Unvanlar listesi alınırken hata:', err.message);
    res.status(500).json({ message: 'Unvanlar listesi alınamadı' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM personel WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Personel bulunamadı' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Personel bilgisi alınırken hata:', err.message);
    res.status(500).json({ message: 'Personel bilgisi alınamadı' });
  }
});

module.exports = router;
