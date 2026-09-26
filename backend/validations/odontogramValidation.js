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
        changedTooth: Joi.number().integer().allow(null),
        previousCondition: Joi.string().allow('', null),
        newCondition: Joi.string().allow('', null),
        notes: Joi.string().allow('', null),
        lastUpdatedBy: Joi.string().uuid().allow('', null),
    }).unknown(true);

    return schema.validate(data);
};

module.exports = { validateOdontogram, validateOdontogramUpdate };
