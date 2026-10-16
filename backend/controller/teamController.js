const crypto = require('crypto');
const { User, Doctor, Clinic } = require('../models');
const { validateUser } = require('../validations/userValidation');
const { Op } = require('sequelize');
const { getPagination, getPagingData } = require('../utils/pagination');
const { withTenantScope } = require('../utils/tenantScope');

const ROLE_HIERARCHY = {
  superadmin: 100,
  owner: 80,
  administrator: 60,
  doctor: 40,
  accountant: 40,
  nurse: 20,
  receptionist: 20,
};

function generateSecureTempPassword(length = 14) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  const bytes = crypto.randomBytes(length * 2);
  let pass = '';
  for (let i = 0; i < bytes.length && pass.length < length; i++) {
    pass += chars[bytes[i] % chars.length];
  }
  if (!/[A-Z]/.test(pass)) pass = 'A' + pass.slice(1);
  if (!/[a-z]/.test(pass)) pass = pass.slice(0, 1) + 'a' + pass.slice(2);
  if (!/[0-9]/.test(pass)) pass = pass.slice(0, 2) + '9' + pass.slice(3);
  return pass;
}

exports.getTeam = async (req, res) => {
  try {
    const { search, role, page, limit } = req.query;
    let where = {};
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

    where = withTenantScope(req, where);

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

exports.getMemberById = async (req, res) => {
  try {
    const member = await User.findOne({
      where: withTenantScope(req, { id: req.params.id }),
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
    const rawPassword = req.body.password || (crypto.randomBytes(8).toString('hex') + 'Aa1!');
    const user = await User.create({
      ...req.body,
      password: rawPassword,
      mustChangePassword: !req.body.password,
      clinicId: req.clinicId,
    });
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateMember = async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const user = await User.findOne({
      where: withTenantScope(req, { id: req.params.id }),
    });
    if (!user) return res.status(404).json({ success: false, message: 'Xodim topilmadi' });

    delete req.body.clinicId;
    await user.update(req.body);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const user = await User.findOne({
      where: withTenantScope(req, { id: req.params.id }),
    });
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

    let where = {
      [Op.or]: [
        { name:  { [Op.iLike]: `%${query}%` } },
        { email: { [Op.iLike]: `%${query}%` } },
        { phone: { [Op.iLike]: `%${query}%` } },
      ],
    };
    where = withTenantScope(req, where);

    const members = await User.findAll({
      where,
      include: [{ model: Doctor, as: 'doctorProfile' }],
      limit: 50,
    });

    res.status(200).json({ success: true, data: members });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.resetStaffPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.scope('withSecrets').findOne({
      where: withTenantScope(req, { id }),
    });

    if (!user) {
      return res.status(404).json({ success: false, code: 'USER_NOT_FOUND', message: 'Xodim topilmadi' });
    }

    // 1. Cannot reset own password via this endpoint
    if (req.user?.id === user.id) {
      return res.status(403).json({
        success: false,
        code: 'AUTH_FORBIDDEN',
        message: "O'z parolingizni bu yerdan tiklay olmaysiz. Sozlamalar -> Xavfsizlik bo'limidan foydalaning.",
      });
    }

    // 2. Cannot reset superadmin or owner passwords via team endpoint
    if (user.role === 'superadmin' || user.role === 'owner') {
      return res.status(403).json({
        success: false,
        code: 'AUTH_FORBIDDEN',
        message: 'Klinika egasi yoki Superadmin parolini tiklash taqiqlangan',
      });
    }

    // 3. Role hierarchy check: requester rank must be strictly higher than target rank
    const requesterRank = ROLE_HIERARCHY[req.user?.role] || 0;
    const targetRank = ROLE_HIERARCHY[user.role] || 0;

    if (requesterRank <= targetRank) {
      return res.status(403).json({
        success: false,
        code: 'AUTH_FORBIDDEN',
        message: 'Faqat o\'zingizdan quyi darajadagi xodimlar parolini tiklay olasiz (teng yoki yuqori rollarga ruxsat berilmagan)',
      });
    }

    // 4. Secure temporary password: at least 14 chars with crypto.randomBytes, no prefix, letters + numbers
    const tempPassword = generateSecureTempPassword(14);

    user.password = tempPassword;
    user.mustChangePassword = true;
    user.refreshToken = null; // Revoke old sessions
    await user.save();

    // 5. Audit log without logging password
    const { logAudit } = require('../utils/auditLogger');
    await logAudit({
      req,
      action: 'RESET_STAFF_PASSWORD',
      resource: 'user',
      resourceId: user.id,
      metadata: { staffEmail: user.email, staffName: user.name, staffRole: user.role },
    });

    // 6. Return temporary password ONCE in response
    return res.status(200).json({
      success: true,
      code: 'AUTH_TEMP_PASSWORD_ISSUED',
      message: 'Xodim uchun vaqtinchalik parol muvaffaqiyatli berildi',
      data: {
        temporaryPassword: tempPassword,
        mustChangePassword: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      temporaryPassword: tempPassword,
      mustChangePassword: true,
    });
  } catch (err) {
    res.status(500).json({ success: false, code: 'INTERNAL_SERVER_ERROR', message: err.message });
  }
};
