'use strict';

/**
 * Global error handler — must be registered LAST in app.js.
 */
const errorHandler = (err, req, res, next) => {
  console.error('[ERROR]', err);

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(422).json({
      success: false,
      message: 'Ma\'lumotlar bazasi validatsiya xatosi',
      errors: err.errors.map((e) => ({ field: e.path, message: e.message })),
    });
  }

  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Ichki server xatosi',
  });
};

module.exports = { errorHandler };
