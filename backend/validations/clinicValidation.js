const Joi = require('joi');

const validateClinic = (data) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        address: Joi.string().allow('', null),
        phone: Joi.string().allow('', null),
        workingHours: Joi.string().allow('', null),
        subscriptionPlan: Joi.string().valid('free', 'starter', 'pro', 'enterprise'),
    });

    return schema.validate(data);
};

module.exports = { validateClinic };
