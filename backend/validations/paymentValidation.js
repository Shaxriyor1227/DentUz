const Joi = require('joi');

const validatePayment = (data) => {
  const schema = Joi.object({
    invoiceId: Joi.string().allow('', null),
    patientId: Joi.string().required(),
    amount: Joi.number().integer().min(1).required(),
    method: Joi.string()
      .valid('Naqd', 'Payme', 'Click', 'Uzcard', 'Humo', 'Bank')
      .default('Naqd'),
    transactionDate: Joi.date().allow(null),
    receiptNumber: Joi.string().allow('', null),
    receivedBy: Joi.string().uuid().allow('', null),
    notes: Joi.string().allow('', null),
    clinicId: Joi.string().uuid().allow('', null),
  });
  return schema.validate(data);
};

module.exports = { validatePayment };
