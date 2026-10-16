const Joi = require('joi');

const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)/;

const validateUser = (user) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    username: Joi.string().allow('', null),
    shortName: Joi.string().allow('', null),
    title: Joi.string().allow('', null),
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(8)
      .pattern(passwordPattern)
      .messages({
        'string.min': 'Parol kamida 8 ta belgidan iborat bo\'lishi shart',
        'string.pattern.base': 'Parolda kamida bitta harf va bitta raqam bo\'lishi shart',
      }),
    role: Joi.string().valid('superadmin', 'owner', 'doctor', 'administrator', 'accountant', 'receptionist', 'nurse'),
    phone: Joi.string().allow('', null),
    avatarUrl: Joi.string().allow('', null),
    clinicId: Joi.string().uuid().allow('', null),
    isActive: Joi.boolean().default(true),
  });

  return schema.validate(user);
};

// Strict validation for public registration endpoint: rejects superadmin role injection
const validateRegistration = (user) => {
  const schema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    username: Joi.string().trim().min(3).max(50).allow('', null),
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(8)
      .pattern(passwordPattern)
      .required()
      .messages({
        'string.min': 'Parol kamida 8 ta belgidan iborat bo\'lishi shart',
        'string.pattern.base': 'Parolda kamida bitta harf va bitta raqam bo\'lishi shart',
      }),
    role: Joi.string().valid('owner').default('owner'), // Never allow 'superadmin' in public register
    phone: Joi.string().allow('', null),
    clinicName: Joi.string().allow('', null),
    clinicId: Joi.string().uuid().allow('', null),
  });

  return schema.validate(user);
};

const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().allow('', null),
    login: Joi.string().allow('', null),
    username: Joi.string().allow('', null),
    password: Joi.string().required(),
  }).or('email', 'login', 'username');

  return schema.validate(data);
};

module.exports = { validateUser, validateRegistration, validateLogin };
