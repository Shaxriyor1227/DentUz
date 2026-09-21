const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

dotenv.config();

const { setupSwagger } = require('./swagger/swaggerConfig');
const { errorHandler } = require('./middleware/errorHandler');
const db = require('./models');

// ─── Route imports ────────────────────────────────────────────────────────────
const authRoutes       = require('./routes/authRoutes');
const clinicRoutes     = require('./routes/clinicRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const financeRoutes = require('./routes/financeRoutes');
const odontogramRoutes = require('./routes/odontogramRoutes');
const teamRoutes = require('./routes/teamRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// ─── Security & Utilities ─────────────────────────────────────────────────────
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── Swagger Docs ─────────────────────────────────────────────────────────────
setupSwagger(app);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/clinics',       clinicRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/odontogram', odontogramRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route topilmadi: ${req.method} ${req.originalUrl}` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Bootstrap ───────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('PostgreSQL ulanish muvaffaqiyatli');

    // alter:true — safe schema sync without dropping tables
    await db.sequelize.sync({ alter: true });
    console.log('Barcha modellar sinxronlashtirildi');

    app.listen(PORT, () => {
      console.log(`DentUz API http://localhost:${PORT} portida ishlamoqda`);
      console.log(`Swagger docs: http://localhost:${PORT}/api/docs`);
    });
  } catch (err) {
    console.error('Server ishga tushmadi:', err);
    process.exit(1);
  }
};

start();
