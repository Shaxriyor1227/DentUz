const Joi = require('joi');

const validateLabOrder = (data) => {
  const schema = Joi.object({
    patientId: Joi.string().required(),
    doctorId: Joi.string().uuid().required(),
    technicianName: Joi.string().required(),
    workType: Joi.string()
      .valid('zirconia_crown', 'pfm_crown', 'e_max_veneer', 'implant_abutment', 'removable_denture', 'clasp_denture', 'aligners', 'other')
      .default('zirconia_crown'),
    toothNumber: Joi.string().allow('', null),
    shade: Joi.string().allow('', null),
    sentDate: Joi.string().isoDate().allow('', null),
    dueDate: Joi.string().isoDate().required(),
    cost: Joi.number().integer().min(0).default(0),
    status: Joi.string()
      .valid('sent', 'in_progress', 'ready', 'fitted', 'redo', 'cancelled')
      .default('sent'),
    notes: Joi.string().allow('', null),
    clinicId: Joi.string().uuid().allow('', null),
  });
  return schema.validate(data);
};

module.exports = { validateLabOrder };
