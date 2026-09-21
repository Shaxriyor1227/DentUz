const Joi = require('joi');

const validateInventory = (data) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    category: Joi.string()
      .valid('consumable', 'implant', 'ortho', 'instrument', 'medication', 'hygiene', 'other')
      .default('consumable'),
    sku: Joi.string().allow('', null),
    quantity: Joi.number().min(0).default(0),
    unit: Joi.string().default('dona'),
    minQuantity: Joi.number().min(0).default(5),
    costPrice: Joi.number().integer().min(0).default(0),
    supplier: Joi.string().allow('', null),
    expiryDate: Joi.string().isoDate().allow('', null),
    batchNumber: Joi.string().allow('', null),
    clinicId: Joi.string().uuid().allow('', null),
  });
  return schema.validate(data);
};

module.exports = { validateInventory };
