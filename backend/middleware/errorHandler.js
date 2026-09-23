
/**
 * Global error handler — must be registered LAST in app.js.
 * Handles all error types with consistent JSON responses.
 */
const errorHandler = (err, req, res, next) => {
  // Log full error in development, minimal in production
  if (process.env.NODE_ENV !== 'production') {
    console.error('[ERROR]', err);
  } else {
    console.error(`[ERROR] ${err.name}: ${err.message}`);
  }

  // Sequelize validation / unique constraint errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(422).json({
      success: false,
      message: 'Validatsiya xatosi',
      errors: err.errors.map((e) => ({ field: e.path, message: e.message })),
    });
  }

  // Sequelize foreign key constraint errors
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(409).json({
      success: false,
      message: 'Bog\'liq ma\'lumotlar mavjud, o\'chirib bo\'lmaydi',
    });
  }

  // JWT errors (in case they bubble up)
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Token noto\'g\'ri' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token muddati tugagan' });
  }

  // Multer file errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, message: 'Fayl hajmi 10 MB dan oshmasligi kerak' });
  }

  // Generic errors
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Ichki server xatosi',
  });
};

module.exports = { errorHandler };
