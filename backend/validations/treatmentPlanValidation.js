const Joi = require('joi');

const validateTreatmentPlan = (data) => {
  const schema = Joi.object({
    id: Joi.string().allow('', null),
    title: Joi.string().default('Davolash rejasi'),
    patientId: Joi.string().required(),
    doctorId: Joi.string().uuid().allow('', null),
    status: Joi.string()
      .valid('draft', 'proposed', 'in_progress', 'completed', 'cancelled')
      .default('draft'),
    totalAmount: Joi.number().integer().min(0).default(0),
    discountAmount: Joi.number().integer().min(0).default(0),
    finalAmount: Joi.number().integer().min(0).default(0),
    paidAmount: Joi.number().integer().min(0).default(0),
    items: Joi.array().default([]),
    notes: Joi.string().allow('', null),
    startDate: Joi.string().isoDate().allow('', null),
    endDate: Joi.string().isoDate().allow('', null),
    clinicId: Joi.string().uuid().allow('', null),
  });
  return schema.validate(data);
};

module.exports = { validateTreatmentPlan };
