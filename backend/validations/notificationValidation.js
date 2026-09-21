const Joi = require('joi');

const validateNotification = (data) => {
    const schema = Joi.object({
        type: Joi.string().required(),
        title: Joi.string().allow('', null),
        body: Joi.string().required(),
        recipientId: Joi.string().allow('', null),
        clinicId: Joi.string().uuid().allow('', null),
        channel: Joi.string().valid('sms', 'telegram', 'in_app').default('in_app'),
        status: Joi.string().valid('pending', 'sent', 'failed', 'read').default('pending'),
        metadata: Joi.object().default({}),
    });

    return schema.validate(data);
};

module.exports = { validateNotification };
