const Joi = require('joi');

const validateService = (data) => {
  const schema = Joi.object({
    id: Joi.string().uuid().allow('', null),
    name: Joi.string().required(),
    category: Joi.string()
      .valid('therapy', 'surgery', 'orthopedics', 'orthodontics', 'periodontics', 'hygiene', 'diagnostics', 'other')
      .default('therapy'),
    code: Joi.string().allow('', null),
    price: Joi.number().integer().min(0).required(),
    duration: Joi.number().integer().min(1).default(30),
    description: Joi.string().allow('', null),
    isActive: Joi.boolean().default(true),
    clinicId: Joi.string().uuid().allow('', null),
  });
  return schema.validate(data);
};

module.exports = { validateService };
