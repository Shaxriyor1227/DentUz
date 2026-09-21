const Joi = require('joi');

const validateUser = (user) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    shortName: Joi.string().allow('', null),
    title: Joi.string().allow('', null),
    email: Joi.string().email().required(),
    password: Joi.string().min(6),
    role: Joi.string().valid('owner', 'doctor', 'receptionist', 'nurse'),
    phone: Joi.string().allow('', null),
    avatarUrl: Joi.string().allow('', null),
    clinicId: Joi.string().uuid().allow('', null),
  });

  return schema.validate(user);
};

const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  return schema.validate(data);
};

module.exports = { validateUser, validateLogin };
