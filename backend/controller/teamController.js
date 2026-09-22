'use strict';

const { User, Doctor, Clinic } = require('../models');
const { validateUser } = require('../validations/userValidation');
const { Op } = require('sequelize');

const getPagination = (page = 1, limit = 20) => ({
  limit: Math.min(parseInt(limit) || 20, 100),
  offset: (Math.max(parseInt(page) || 1, 1) - 1) * Math.min(parseInt(limit) || 20, 100),
});

exports.getTeam = async (req, res) => {
  try {
    const { search, role, page, limit } = req.query;
    const where = {};
    const { limit: lim, offset } = getPagination(page, limit);

    if (role) where.role = role;

    if (search && search.trim()) {
      const q = search.trim();
      where[Op.or] = [
        { name:  { [Op.iLike]: `%${q}%` } },
        { email: { [Op.iLike]: `%${q}%` } },
        { phone: { [Op.iLike]: `%${q}%` } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      include: [
        { model: Doctor, as: 'doctorProfile' },
        { model: Clinic, as: 'clinic'        },
      ],
      order: [['createdAt', 'ASC']],
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

exports.getMemberById = async (req, res) => {
  try {
    const member = await User.findByPk(req.params.id, {
      include: [{ model: Doctor, as: 'doctorProfile' }],
    });
    if (!member) return res.status(404).json({ success: false, message: 'Xodim topilmadi' });
    res.status(200).json({ success: true, data: member });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addMember = async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateMember = async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Xodim topilmadi' });

    await user.update(req.body);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Xodim topilmadi' });

    if (user.role === 'owner') {
      return res.status(403).json({ success: false, message: 'Owner o\'chirilmaydi' });
    }

    const data = user.toJSON();
    await user.destroy();
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.searchMember = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ success: false, message: 'Qidiruv so\'zi kiritilmadi' });

    const members = await User.findAll({
      where: {
        [Op.or]: [
          { name:  { [Op.iLike]: `%${query}%` } },
          { email: { [Op.iLike]: `%${query}%` } },
          { phone: { [Op.iLike]: `%${query}%` } },
        ],
      },
      include: [{ model: Doctor, as: 'doctorProfile' }],
      limit: 50,
    });

    res.status(200).json({ success: true, data: members });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
