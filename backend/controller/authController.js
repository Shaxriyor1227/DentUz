'use strict';

const jwt = require('jsonwebtoken');
const { User } = require('../models');

const signTokens = (userId) => {
  const access = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
  const refresh = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
  return { access, refresh };
};

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Must use scope 'withSecrets' to include password field
    const user = await User.scope('withSecrets').findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email yoki parol noto\'g\'ri' });
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Email yoki parol noto\'g\'ri' });
    }

    const { access, refresh } = signTokens(user.id);

    // Persist refresh token
    await user.update({ refreshToken: refresh });

    // Build safe user payload (mirrors frontend AuthContext shape)
    const userPayload = {
      id: user.id,
      name: user.name,
      shortName: user.shortName,
      title: user.title,
      email: user.email,
      role: user.role,
      clinicId: user.clinicId,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
    };

    res.json({ success: true, token: access, refreshToken: refresh, user: userPayload });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/refresh
 * Body: { refreshToken }
 */
exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token taqdim etilmagan' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.scope('withSecrets').findByPk(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token noto\'g\'ri' });
    }

    const { access, refresh } = signTokens(user.id);
    await user.update({ refreshToken: refresh });

    res.json({ success: true, token: access, refreshToken: refresh });
  } catch (err) {
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Refresh token noto\'g\'ri yoki muddati tugagan' });
    }
    next(err);
  }
};

/**
 * POST /api/auth/logout
 * Requires: authenticate middleware
 */
exports.logout = async (req, res, next) => {
  try {
    await User.scope('withSecrets')
      .findByPk(req.user.id)
      .then((u) => u && u.update({ refreshToken: null }));
    res.json({ success: true, message: 'Tizimdan chiqildi' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Requires: authenticate middleware
 */
exports.me = (req, res) => {
  res.json({ success: true, user: req.user });
};
