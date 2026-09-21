'use strict';

const { User, Doctor } = require('../models');

/** GET /api/team — list all clinic team members */
exports.getTeam = async (req, res, next) => {
  try {
    const users = await User.findAll({
      where: { clinicId: req.user.clinicId },
      include: [{ model: Doctor, as: 'doctorProfile' }],
    });

    // Map to frontend teamApi shape
    const team = users.map((u) => ({
      id: u.id,
      name: u.name,
      initials: u.name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .substring(0, 2)
        .toUpperCase(),
      role: mapRoleLabel(u.role),
      roleType: u.role,
      title: u.title,
      email: u.email,
      phone: u.phone,
      avatarUrl: u.avatarUrl,
      branch: 'Markaziy Klinika',
      status: 'offline',
    }));

    res.json({ success: true, team });
  } catch (err) {
    next(err);
  }
};

/** POST /api/team — add team member */
exports.addMember = async (req, res, next) => {
  try {
    const user = await User.create({ ...req.body, clinicId: req.user.clinicId });
    res.status(201).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

/** PUT /api/team/:id — update team member */
exports.updateMember = async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.params.id, clinicId: req.user.clinicId } });
    if (!user) return res.status(404).json({ success: false, message: 'Xodim topilmadi' });
    await user.update(req.body);
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/team/:id */
exports.removeMember = async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.params.id, clinicId: req.user.clinicId } });
    if (!user) return res.status(404).json({ success: false, message: 'Xodim topilmadi' });
    if (user.role === 'owner') {
      return res.status(403).json({ success: false, message: 'Egasini o\'chirish mumkin emas' });
    }
    await user.destroy();
    res.json({ success: true, message: 'Xodim o\'chirildi' });
  } catch (err) {
    next(err);
  }
};

// Map DB role to Uzbek display label (matches frontend teamApi)
function mapRoleLabel(role) {
  const labels = {
    owner: 'Egasi',
    doctor: 'Shifokor',
    receptionist: 'Administrator',
    nurse: 'Hamshira',
  };
  return labels[role] || role;
}
