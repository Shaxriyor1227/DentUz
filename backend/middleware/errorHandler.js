const logger = require('../utils/logger');

/**
 * Global error handler — must be registered LAST in app.js.
 * Handles all error types with consistent JSON responses.
 * Never leaks stack traces or internal DB error details in production.
 */
const errorHandler = (err, req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const requestId = req.headers['x-request-id'] || req.id;

  logger.error(err.message, {
    requestId,
    name: err.name,
    code: err.code,
    stack: isProduction ? undefined : err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  // Sequelize validation / unique constraint errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(422).json({
      success: false,
      message: 'Validatsiya xatosi',
      errors: err.errors ? err.errors.map((e) => ({ field: e.path, message: e.message })) : [],
    });
  }

  // Sequelize foreign key constraint errors
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(409).json({
      success: false,
      message: 'Bog\'liq ma\'lumotlar mavjud, o\'chirib bo\'lmaydi',
    });
  }

  // JWT errors
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

  const status = err.statusCode || err.status || 500;
  // In production, mask internal 500 errors to avoid information disclosure
  const message = status === 500 && isProduction
    ? 'Ichki server xatosi yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.'
    : (err.message || 'Ichki server xatosi');

  res.status(status).json({
    success: false,
    message,
  });
};

module.exports = { errorHandler };
