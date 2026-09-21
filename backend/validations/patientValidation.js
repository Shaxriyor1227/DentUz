const Joi = require('joi');

const validatePatient = (patient) => {
  const schema = Joi.object({
    id: Joi.string().allow('', null),
    name: Joi.string().required(),
    phone: Joi.string().allow('', null),
    birthdate: Joi.string().isoDate().allow('', null),
    age: Joi.number().integer().min(0).max(130).allow(null),
    lastVisit: Joi.string().isoDate().allow('', null),
    lastProcedure: Joi.string().allow('', null),
    nextVisit: Joi.date().allow(null),
    status: Joi.string().valid('today', 'scheduled', 'debtor', 'all'),
    allergies: Joi.string().allow('', null),
    notes: Joi.string().allow('', null),
    balance: Joi.number().allow(null),
    clinicId: Joi.string().uuid().allow('', null),
  });

  return schema.validate(patient);
};

module.exports = { validatePatient };
