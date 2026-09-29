const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

dotenv.config();

// Fail-fast validation for critical JWT environment variables
if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.error('========================================================================');
  console.error('KRITIK XAVFSIZLIK XATOSI: JWT_SECRET yoki JWT_REFRESH_SECRET topilmadi!');
  console.error('Server ishga tushirilmadi. Iltimos, backend/.env faylida ushbu kalitlarni belgilang.');
  console.error('========================================================================');
  process.exit(1);
}

const rateLimit = require('express-rate-limit');
const { setupSwagger } = require('./swagger/swaggerConfig');
const { errorHandler } = require('./middleware/errorHandler');
const { authenticate } = require('./middleware/auth');
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
const superAdminRoutes = require('./routes/superAdminRoutes');
const { tenantMiddleware } = require('./middleware/tenantMiddleware');

const app = express();

// Trust reverse proxy (Render.com, Nginx, Cloudflare) for accurate client IP identification in rate-limiters
app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());

// Whitelist CORS configuration
const allowedOrigins = (process.env.CORS_ORIGINS || process.env.CLIENT_URL || 'http://localhost:3000,http://localhost:3001,http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile, server-to-server, curl, uptime monitor)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      allowedOrigins.includes('*') ||
      origin.endsWith('.vercel.app') ||
      origin.includes('vercel.app')
    ) {
      return callback(null, true);
    }
    return callback(new Error(`CORS bloklandi: Ushbu domendan so'rov qabul qilinmaydi (${origin})`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// General soft rate-limiter for all /api endpoints (max 600 req per 15 min per IP)
const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { success: false, message: 'Juda ko\'p so\'rov yuborildi. Iltimos, keyinroq qayta urinib ko\'ring.' }
});
app.use('/api', generalApiLimiter);

setupSwagger(app);

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'DentUz API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.head('/', (req, res) => {
  res.status(200).end();
});

// Health / Uptime public endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});

// Authentication routes (login, register, refresh are public with rate-limiting; me, logout are authenticated)
app.use('/api/auth', authRoutes);

// Clinic routes (/api/clinics/apply is public for clinic registration; others authenticated)
app.use('/api', clinicRoutes);

// Protected application modules - ALL require valid JWT authentication & tenant isolation
app.use('/api', authenticate, tenantMiddleware, patientRoutes);
app.use('/api', authenticate, tenantMiddleware, appointmentRoutes);
app.use('/api', authenticate, tenantMiddleware, financeRoutes);
app.use('/api', authenticate, tenantMiddleware, odontogramRoutes);
app.use('/api', authenticate, tenantMiddleware, teamRoutes);
app.use('/api', authenticate, tenantMiddleware, userRoutes);
app.use('/api', authenticate, tenantMiddleware, notificationRoutes);
app.use('/api', authenticate, tenantMiddleware, serviceRoutes);
app.use('/api', authenticate, tenantMiddleware, treatmentPlanRoutes);
app.use('/api', authenticate, tenantMiddleware, paymentRoutes);
app.use('/api', authenticate, tenantMiddleware, medicalRecordRoutes);
app.use('/api', authenticate, tenantMiddleware, labOrderRoutes);
app.use('/api', authenticate, tenantMiddleware, inventoryRoutes);

// SuperAdmin module - requires valid JWT authentication + superadmin role
app.use('/api/superadmin', superAdminRoutes);

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
