const Joi = require('joi');

const validateMedicalRecord = (data) => {
  const schema = Joi.object({
    patientId: Joi.string().required(),
    doctorId: Joi.string().uuid().required(),
    appointmentId: Joi.string().uuid().allow('', null),
    visitDate: Joi.date().default(() => new Date()),
    toothNumber: Joi.string().allow('', null),
    complaints: Joi.string().allow('', null),
    objectiveStatus: Joi.string().allow('', null),
    diagnosis: Joi.string().allow('', null),
    treatmentDone: Joi.string().allow('', null),
    anesthesia: Joi.string().allow('', null),
    recommendations: Joi.string().allow('', null),
    attachments: Joi.array().default([]),
    clinicId: Joi.string().uuid().allow('', null),
  });
  return schema.validate(data);
};

module.exports = { validateMedicalRecord };
