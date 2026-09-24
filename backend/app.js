const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

dotenv.config();

const { setupSwagger } = require('./swagger/swaggerConfig');
const { errorHandler } = require('./middleware/errorHandler');
const db = require('./models');

const authRoutes = require('./routes/authRoutes');
const clinicRoutes = require('./routes/clinicRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const financeRoutes = require('./routes/financeRoutes');
const odontogramRoutes = require('./routes/odontogramRoutes');
const teamRoutes = require('./routes/teamRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const treatmentPlanRoutes = require('./routes/treatmentPlanRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const medicalRecordRoutes = require('./routes/medicalRecordRoutes');
const labOrderRoutes = require('./routes/labOrderRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.options('*', cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

setupSwagger(app);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});

app.use('/api/auth', authRoutes);
app.use('/api', clinicRoutes);
app.use('/api', patientRoutes);
app.use('/api', appointmentRoutes);
app.use('/api', financeRoutes);
app.use('/api', odontogramRoutes);
app.use('/api', teamRoutes);
app.use('/api', userRoutes);
app.use('/api', notificationRoutes);
app.use('/api', serviceRoutes);
app.use('/api', treatmentPlanRoutes);
app.use('/api', paymentRoutes);
app.use('/api', medicalRecordRoutes);
app.use('/api', labOrderRoutes);
app.use('/api', inventoryRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route topilmadi: ${req.method} ${req.originalUrl}` });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('PostgreSQL ulanish muvaffaqiyatli');

    await db.sequelize.sync({ alter: true });
    console.log('Barcha modellar sinxronlashtirildi');

    app.listen(PORT, () => {
      console.log(`DentUz API http://localhost:${PORT} portida ishlamoqda`);
      console.log(`Swagger docs: http://localhost:${PORT}/api/docs`);

      // 2027-style Interactive Telegram Bot
      try {
        const bot = require('./services/telegramBot');
        bot.startPolling();
      } catch (botErr) {
        console.warn('Bot start error:', botErr.message);
      }
    });
  } catch (err) {
    console.error('Server ishga tushmadi:', err);
    process.exit(1);
  }
};

start();

const gracefulShutdown = () => {
  try {
    const bot = require('./services/telegramBot');
    bot.stopPolling();
  } catch {}
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
