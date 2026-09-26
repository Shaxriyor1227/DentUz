const Joi = require('joi');

const validateAppointment = (appointment) => {
  const schema = Joi.object({
    id: Joi.string().allow('', null),
    time: Joi.string().required(),
    duration: Joi.number().integer().min(5).max(480).default(30),
    patientId: Joi.string().allow('', null).optional(),
    patientName: Joi.string().allow('', null),
    patientPhone: Joi.string().allow('', null),
    procedure: Joi.string().allow('', null),
    doctorId: Joi.string().uuid().allow('', null),
    doctorSlug: Joi.string().allow('', null),
    doctorName: Joi.string().allow('', null),
    doctor: Joi.string().allow('', null),
    status: Joi.string().valid('pending', 'in_progress', 'completed', 'cancelled').default('pending'),
    day: Joi.string().allow('', null),
    date: Joi.string().required(),
    chair: Joi.number().integer().allow(null),
    color: Joi.string().allow('', null),
    clinicId: Joi.string().uuid().allow('', null),
  }).unknown(true);

  return schema.validate(appointment);
};

module.exports = { validateAppointment };
