/**
 * Joi Validation Middleware for Express
 * Validates req.body using either a Joi schema or a validator function
 */
const validate = (schemaOrFn) => {
  return (req, res, next) => {
    if (!schemaOrFn) return next();

    let error;
    if (typeof schemaOrFn === 'function') {
      const result = schemaOrFn(req.body);
      error = result?.error;
    } else if (schemaOrFn?.validate) {
      const result = schemaOrFn.validate(req.body);
      error = result?.error;
    }

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details ? error.details[0].message : error.message,
      });
    }

    next();
  };
};

module.exports = { validate };
