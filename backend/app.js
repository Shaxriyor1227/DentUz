const path = require('path');
const crypto = require('crypto');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

dotenv.config();

const logger = require('./utils/logger');
const { validateEnvironment } = require('./config/validateEnv');
const { assertNoPendingMigrations } = require('./config/migrator');

// Validate mandatory environment variables (fails fast if invalid)
validateEnvironment();

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
const auditLogRoutes = require('./routes/auditLogRoutes');
const { tenantMiddleware } = require('./middleware/tenantMiddleware');

const app = express();

// Trust reverse proxy (Render.com, Nginx, Cloudflare) for accurate client IP identification in rate-limiters
app.set('trust proxy', 1);

// Security Headers: Helmet with API-safe policies
app.use(
  helmet({
    contentSecurityPolicy: false, // APIs return JSON; CSP configured on frontend CDN
    crossOriginResourcePolicy: { policy: 'same-origin' },
  })
);
app.use(
  compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) return false;
      return compression.filter(req, res);
    },
  })
);

// Request ID and Request Logging Middleware
app.use((req, res, next) => {
  const reqId = req.headers['x-request-id'] || crypto.randomUUID();
  req.id = reqId;
  res.setHeader('X-Request-Id', reqId);
  next();
});

// Whitelist CORS configuration — Wildcard vercel.app domains removed
const allowedOrigins = (
  process.env.CORS_ORIGINS ||
  process.env.CLIENT_URL ||
  'http://localhost:3000,http://localhost:3001,http://localhost:5173'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (mobile, server-to-server, curl, uptime monitor)
      if (!origin) return callback(null, true);

      // Check exact whitelisted origins
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }

      // Explicit, optional Vercel Preview URL matching if configured via VERCEL_PREVIEW_PREFIX
      const previewPrefix = process.env.VERCEL_PREVIEW_PREFIX;
      if (
        previewPrefix &&
        origin.startsWith(`https://${previewPrefix}`) &&
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }

      logger.warn(`CORS bloklandi: Ushbu domendan so'rov rad etildi (${origin})`);
      return callback(
        new Error(`CORS bloklandi: Ushbu domendan so'rov qabul qilinmaydi (${origin})`)
      );
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Request-Id'],
  })
);
app.options('*', cors());

// Lowered payload limit to 1MB (file attachments are streamed via multer)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// NOTE: app.use('/uploads', express.static(...)) removed for medical data protection!
// Files are served securely via GET /api/medical-records/:id/files/:fileId with auth & tenant checks.

// General soft rate-limiter for all /api endpoints (max 600 req per 15 min per IP)
const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    success: false,
    message: "Juda ko'p so'rov yuborildi. Iltimos, keyinroq qayta urinib ko'ring.",
  },
});
// Health / Uptime public endpoint with fast database connectivity check (timeout: 2000ms)
// Placed before generalApiLimiter so external uptime monitors (UptimeRobot) are never blocked
app.get('/api/health', async (req, res) => {
  try {
    const pingPromise = db.sequelize.authenticate();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Baza ulanishi vaqti tugadi (2s timeout)')), 2000)
    );
    await Promise.race([pingPromise, timeoutPromise]);

    res.status(200).json({
      status: 'ok',
      uptime: Math.floor(process.uptime()),
      database: 'connected',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development',
    });
  } catch (err) {
    res.status(503).json({
      status: 'degraded',
      database: 'disconnected',
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

app.use('/api', generalApiLimiter);

setupSwagger(app);

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'DentUz API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.head('/', (req, res) => {
  res.status(200).end();
});

// Authentication routes (login, register, refresh are public with rate-limiting; me, logout are authenticated)
app.use('/api/auth', authRoutes);

// Clinic routes (/api/clinics/apply is public for clinic registration; other routes authenticated & tenant-scoped)
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
app.use('/api', authenticate, tenantMiddleware, auditLogRoutes);

// SuperAdmin module - requires valid JWT authentication + superadmin role
app.use('/api/superadmin', superAdminRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route topilmadi: ${req.method} ${req.originalUrl}`,
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await db.sequelize.authenticate();
    logger.info('PostgreSQL ulanish muvaffaqiyatli');

    // Verify all database migrations are applied before accepting requests
    await assertNoPendingMigrations();

    // In production, disable sequelize.sync({ alter: true }) to prevent data loss or lockups.
    // In development, sync is allowed.
    if (process.env.NODE_ENV !== 'production') {
      await db.sequelize.sync({ alter: true });
      logger.info('Barcha modellar sinxronlashtirildi (development sync)');
    } else {
      logger.info('Production muhiti: sequelize.sync() o\'chirilgan, migratsiyalar ishlatiladi.');
    }

    const server = app.listen(PORT, () => {
      logger.info(`DentUz API http://localhost:${PORT} portida ishlamoqda`);
      if (process.env.ENABLE_SWAGGER === 'true' || process.env.NODE_ENV !== 'production') {
        logger.info(`Swagger docs: http://localhost:${PORT}/api/docs`);
      }

      // Telegram Bot: Separated from web server. Only starts if explicitly enabled via BOT_ENABLED=true
      if (process.env.BOT_ENABLED === 'true') {
        try {
          const bot = require('./services/telegramBot');
          bot.startPolling();
          logger.info('Interactive Telegram Bot ishga tushirildi (BOT_ENABLED=true)');
        } catch (botErr) {
          logger.warn('Bot start error:', { message: botErr.message });
        }
      }
    });

    return server;
  } catch (err) {
    logger.error('Server ishga tushmadi:', err);
    process.exit(1);
  }
};

if (require.main === module) {
  start();
}

const gracefulShutdown = () => {
  try {
    if (process.env.BOT_ENABLED === 'true') {
      const bot = require('./services/telegramBot');
      bot.stopPolling();
    }
  } catch {}
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

module.exports = app;
