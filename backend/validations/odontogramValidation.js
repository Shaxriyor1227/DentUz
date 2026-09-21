const Joi = require('joi');

const validateOdontogram = (data) => {
    const schema = Joi.object({
        patientId: Joi.string().required(),
        teeth: Joi.object().default({}),
        lastUpdatedBy: Joi.string().uuid().allow('', null),
    });

    return schema.validate(data);
};

const validateOdontogramUpdate = (data) => {
    const schema = Joi.object({
        teeth: Joi.object().required(),
        lastUpdatedBy: Joi.string().uuid().allow('', null),
    });

    return schema.validate(data);
};

module.exports = { validateOdontogram, validateOdontogramUpdate };
