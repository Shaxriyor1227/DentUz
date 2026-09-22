'use strict';

const { Service } = require('../models');
const { validateService } = require('../validations/serviceValidation');
const { Op } = require('sequelize');

const getPagination = (page = 1, limit = 20) => ({
  limit: Math.min(parseInt(limit) || 20, 100),
  offset: (Math.max(parseInt(page) || 1, 1) - 1) * Math.min(parseInt(limit) || 20, 100),
});

exports.createService = async (req, res) => {
  const { error } = validateService(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const service = await Service.create(req.body);
    res.status(201).json({ success: true, data: service });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getServices = async (req, res) => {
  try {
    const { category, isActive, search, page, limit } = req.query;
    const where = {};
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

    const { count, rows } = await Service.findAndCountAll({
      where,
      order: [['category', 'ASC'], ['name', 'ASC']],
      limit: lim,
      offset,
    });

    res.status(200).json({
      success: true,
      total: count,
      page: Math.max(parseInt(page) || 1, 1),
      limit: lim,
      data: rows,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
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
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Xizmat topilmadi' });

    await service.update(req.body);
    res.status(200).json({ success: true, data: service });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Xizmat topilmadi' });

    await service.destroy();
    res.status(200).json({ success: true, message: 'Xizmat o\'chirildi' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.searchServices = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ success: false, message: 'Qidiruv so\'zi kiritilmadi' });

    const services = await Service.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { code: { [Op.iLike]: `%${query}%` } },
        ],
      },
      limit: 50,
    });

    res.status(200).json({ success: true, data: services });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
