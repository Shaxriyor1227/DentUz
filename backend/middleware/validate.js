'use strict';

const { validationResult } = require('express-validator');

/**
 * validate — runs after express-validator chains.
 * Returns 422 with formatted error array if any validation fails.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validatsiya xatosi',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = { validate };
