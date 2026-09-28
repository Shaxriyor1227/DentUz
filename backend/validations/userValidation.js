const Joi = require('joi');

const validateUser = (user) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    username: Joi.string().allow('', null),
    shortName: Joi.string().allow('', null),
    title: Joi.string().allow('', null),
    email: Joi.string().required(),
    password: Joi.string().min(6),
    role: Joi.string().valid('superadmin', 'owner', 'doctor', 'receptionist', 'nurse'),
    phone: Joi.string().allow('', null),
    avatarUrl: Joi.string().allow('', null),
    clinicId: Joi.string().uuid().allow('', null),
    isActive: Joi.boolean().default(true),
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

module.exports = { validateUser, validateLogin };
