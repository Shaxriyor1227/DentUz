const { User, Doctor, Clinic } = require('../models');
const { validateUser } = require('../validations/userValidation');
const { Op } = require('sequelize');
const { withTenantScope } = require('../utils/tenantScope');

exports.createUser = async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const user = await User.create({
      ...req.body,
      clinicId: req.clinicId,
    });
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { search, role } = req.query;
    let where = {};

    if (role) where.role = role;

    if (search && search.trim()) {
      const q = search.trim();
      where[Op.or] = [
        { name:  { [Op.iLike]: `%${q}%` } },
        { email: { [Op.iLike]: `%${q}%` } },
        { phone: { [Op.iLike]: `%${q}%` } },
      ];
    }

    where = withTenantScope(req, where);
    const users = await User.findAll({
      where,
      include: [
        { model: Doctor, as: 'doctorProfile' },
        { model: Clinic, as: 'clinic'        },
      ],
      order: [['createdAt', 'ASC']],
    });
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findOne({
      where: withTenantScope(req, { id: req.params.id }),
      include: [
        { model: Doctor, as: 'doctorProfile' },
        { model: Clinic, as: 'clinic'        },
      ],
    });
    if (!user) return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const user = await User.findOne({
      where: withTenantScope(req, { id: req.params.id }),
    });
    if (!user) return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });

    delete req.body.clinicId;
    await user.update(req.body);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findOne({
      where: withTenantScope(req, { id: req.params.id }),
    });
    if (!user) return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });

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

exports.searchUser = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ success: false, message: 'Qidiruv so\'zi kiritilmadi' });

    let where = {
      [Op.or]: [
        { name:  { [Op.iLike]: `%${query}%` } },
        { email: { [Op.iLike]: `%${query}%` } },
        { phone: { [Op.iLike]: `%${query}%` } },
      ],
    };
    where = withTenantScope(req, where);

    const users = await User.findAll({
      where,
      limit: 50,
    });

    res.status(200).json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
