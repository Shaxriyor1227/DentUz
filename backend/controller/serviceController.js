const { Service } = require('../models');
const { validateService } = require('../validations/serviceValidation');
const { Op } = require('sequelize');
const { getPagination, getPagingData } = require('../utils/pagination');
const { withTenantScope } = require('../utils/tenantScope');

exports.createService = async (req, res) => {
  const { error } = validateService(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const service = await Service.create({
      ...req.body,
      clinicId: req.clinicId,
    });
    res.status(201).json({ success: true, data: service });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getServices = async (req, res) => {
  try {
    const { category, isActive, search, page, limit } = req.query;
    let where = {};
    const { limit: lim, offset } = getPagination(page, limit);

    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    if (search && search.trim()) {
      const q = search.trim();
      where[Op.or] = [
        { name:        { [Op.iLike]: `%${q}%` } },
        { code:        { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } },
      ];
    }

    where = withTenantScope(req, where);

    const { count, rows } = await Service.findAndCountAll({
      where,
      order: [['category', 'ASC'], ['name', 'ASC']],
      limit: lim,
      offset,
    });

    const paging = getPagingData({ count, rows }, page, lim);
    res.status(200).json({
      success: true,
      ...paging,
      data: rows,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findOne({
      where: withTenantScope(req, { id: req.params.id }),
    });
    if (!service) return res.status(404).json({ success: false, message: 'Xizmat topilmadi' });
    res.status(200).json({ success: true, data: service });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateService = async (req, res) => {
  const { error } = validateService(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const service = await Service.findOne({
      where: withTenantScope(req, { id: req.params.id }),
    });
    if (!service) return res.status(404).json({ success: false, message: 'Xizmat topilmadi' });

    delete req.body.clinicId;
    await service.update(req.body);
    res.status(200).json({ success: true, data: service });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findOne({
      where: withTenantScope(req, { id: req.params.id }),
    });
    if (!service) return res.status(404).json({ success: false, message: 'Xizmat topilmadi' });

    const data = service.toJSON();
    await service.destroy();
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
