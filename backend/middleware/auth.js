'use strict';

const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * authenticate — verifies JWT from Authorization header.
 * Attaches `req.user` (without password/refreshToken) on success.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token taqdim etilmagan' });
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Foydalanuvchi topilmadi' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token muddati tugagan' });
    }
    return res.status(401).json({ success: false, message: 'Token noto\'g\'ri' });
  }
};

/**
 * authorize(...roles) — role-based access control guard.
 * Must be used AFTER authenticate middleware.
 *
 * Usage:  router.get('/admin', authenticate, authorize('owner'), handler)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Autentifikatsiya talab etiladi' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Ruxsat yo'q. Talab qilinadigan rol: ${roles.join(' | ')}`,
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
