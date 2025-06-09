require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const app = express();
const port = process.env.PORT || 3001;

const logger = require('./utils/logger');
const requestLogger = require('./middleware/requestLogger');
const errorLogger = require('./middleware/errorLogger');

const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

const personelRoutes = require('./routes/personel');
const authRoutes = require('./routes/auth');
const illerRoutes = require('./routes/iller');
const adliyelerRoutes = require('./routes/adliyeler');
const tayinTalepleriRouter = require('./routes/tayinTalepleri');
const adminRoutes = require('./routes/adminRoutes');

app.use(cors(corsOptions));
app.use(express.json());

app.use(requestLogger);

app.use('/api/personel', personelRoutes);
app.use('/api', authRoutes);
app.use('/api/iller', illerRoutes);
app.use('/api/adliyeler', adliyelerRoutes);
app.use('/api/tayin-talepleri', tayinTalepleriRouter);
app.use('/api/admin', adminRoutes);

app.get('/api/unvanlar', (req, res) => {
  const unvanlar = ['yaziislerimuduru', 'zabitkatibi', 'mubasir', 'diger'];
  res.json(unvanlar);
});

app.use((req, res, next) => {
  logger.warn(`404 - Sayfa Bulunamadı: ${req.originalUrl}`, {
    method: req.method,
    ip: req.ip
  });
  res.status(404).json({ message: 'Sayfa bulunamadı' });
});

app.use(errorLogger);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`Sunucu ${PORT} portunda başlatıldı`, {
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});