const Joi = require('joi');

const validateInvoice = (invoice) => {
  const schema = Joi.object({
    id: Joi.string().allow('', null),
    patientId: Joi.string().allow('', null),
    patient: Joi.string().allow('', null),
    doctor: Joi.string().allow('', null),
    procedure: Joi.string().allow('', null),
    date: Joi.date().allow(null),
    method: Joi.string().valid('Naqd', 'Payme', 'Click', 'Uzcard', 'Humo', 'Bank'),
    amount: Joi.number().required(),
    status: Joi.string().valid('paid', 'pending', 'partial', 'cancelled'),
    clinicId: Joi.string().uuid().allow('', null),
  });

  return schema.validate(invoice);
};

module.exports = { validateInvoice };
