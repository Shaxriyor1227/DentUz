
const jwt = require('jsonwebtoken');
const { User, Clinic } = require('../models');
const { validateLogin, validateUser } = require('../validations/userValidation');

const signTokens = (userId) => {
  const access = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
  const refresh = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
  return { access, refresh };
};

exports.register = async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const existing = await User.findOne({ where: { email: req.body.email } });
    if (existing) return res.status(409).json({ success: false, message: 'Bu email allaqachon ro\'yxatdan o\'tgan' });

    const user = await User.create(req.body);
    const { access, refresh } = signTokens(user.id);
    await user.update({ refreshToken: refresh });

    res.status(201).json({ success: true, token: access, refreshToken: refresh, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const { email, password } = req.body;
    const user = await User.scope('withSecrets').findOne({
      where: { email },
      include: [{ model: Clinic, as: 'clinic' }],
    });

    if (!user) return res.status(401).json({ success: false, message: 'Email yoki parol noto\'g\'ri' });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ success: false, message: 'Email yoki parol noto\'g\'ri' });

    const { access, refresh } = signTokens(user.id);
    await user.update({ refreshToken: refresh });

    const userPayload = {
      id: user.id,
      name: user.name,
      shortName: user.shortName,
      title: user.title,
      email: user.email,
      role: user.role,
      clinicId: user.clinicId,
      clinic: user.clinic,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
    };

    res.status(200).json({ success: true, token: access, refreshToken: refresh, data: userPayload });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ success: false, message: 'Refresh token kiritilmadi' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.scope('withSecrets').findByPk(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token noto\'g\'ri' });
    }

    const { access, refresh } = signTokens(user.id);
    await user.update({ refreshToken: refresh });

    res.status(200).json({ success: true, token: access, refreshToken: refresh });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Refresh token muddati tugagan yoki noto\'g\'ri' });
  }
};

exports.logout = async (req, res) => {
  try {
    if (req.user?.id) {
      const u = await User.scope('withSecrets').findByPk(req.user.id);
      if (u) await u.update({ refreshToken: null });
    }
    res.status(200).json({ success: true, message: 'Tizimdan chiqildi' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.me = (req, res) => {
  res.status(200).json({ success: true, data: req.user });
};
