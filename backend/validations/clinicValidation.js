const Joi = require('joi');

const validateClinic = (data) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        address: Joi.string().allow('', null),
        phone: Joi.string().allow('', null),
        workingHours: Joi.string().allow('', null),
        subscriptionPlan: Joi.string().valid('free', 'starter', 'pro', 'enterprise'),
        chairsCount: Joi.number().integer().min(1).max(50).allow(null),
        status: Joi.string().valid('active', 'inactive', 'suspended').allow(null),
        email: Joi.string().email().allow('', null),
        ownerName: Joi.string().allow('', null),
    }).unknown(true);

    return schema.validate(data);
};

module.exports = { validateClinic };
