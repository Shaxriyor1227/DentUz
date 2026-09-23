
const { User, Doctor, Clinic } = require('../models');
const { validateUser } = require('../validations/userValidation');
const { Op } = require('sequelize');

exports.createUser = async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        { model: Doctor, as: 'doctorProfile' },
        { model: Clinic, as: 'clinic'        },
      ],
    });
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
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
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });

    await user.update(req.body);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });

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

    const users = await User.findAll({
      where: {
        [Op.or]: [
          { name:  { [Op.iLike]: `%${query}%` } },
          { email: { [Op.iLike]: `%${query}%` } },
          { phone: { [Op.iLike]: `%${query}%` } },
        ],
      },
      limit: 50,
    });

    res.status(200).json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
