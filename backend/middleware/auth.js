
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

    const token = authHeader.slice(7).trim();
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token taqdim etilmagan' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token muddati tugagan' });
      }
      return res.status(401).json({ success: false, message: 'Token noto\'g\'ri' });
    }

    const user = await User.findByPk(decoded.id);
    if (!user || user.isActive === false) {
      return res.status(401).json({ success: false, message: 'Foydalanuvchi topilmadi yoki hisob faol emas' });
    }

    req.user = user;
    return next();
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
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
    if (req.user.role === 'superadmin') {
      return next();
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
