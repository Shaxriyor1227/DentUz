const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, Clinic } = require('../models');
const { Op } = require('sequelize');
const { validateLogin, validateRegistration } = require('../validations/userValidation');

// In-memory failed login tracking for brute-force mitigation
// { [identifier]: { count: number, lockedUntil: number } }
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

const hashRefreshToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

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
  // Prevent any privilege escalation: reject superadmin assignment
  if (req.body.role && req.body.role === 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Xavfsizlik xatosi: Superadmin roli faqat platforma orqali berilishi mumkin',
    });
  }

  const { error } = validateRegistration(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const email = req.body.email.toLowerCase().trim();
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ success: false, message: 'Bu email allaqachon ro\'yxatdan o\'tgan' });

    // Sanitize payload: always force role to 'owner' for public registration
    const payload = {
      ...req.body,
      email,
      role: 'owner',
      clinicId: req.body.clinicId || null,
    };

    const user = await User.create(payload);
    const { access, refresh } = signTokens(user.id);

    // Save SHA-256 hashed refresh token in database
    await user.update({ refreshToken: hashRefreshToken(refresh) });

    const safeUser = user.toJSON();
    delete safeUser.password;
    delete safeUser.refreshToken;

    res.status(201).json({ success: true, token: access, refreshToken: refresh, data: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const rawId = (req.body.login || req.body.username || req.body.email || '').trim();
    const identifier = rawId.toLowerCase();
    const { password } = req.body;
    const now = Date.now();

    // Check account lockout status
    const attemptRecord = loginAttempts.get(identifier);
    if (attemptRecord && attemptRecord.lockedUntil > now) {
      const remainingMin = Math.ceil((attemptRecord.lockedUntil - now) / 60000);
      return res.status(429).json({
        success: false,
        message: `Xavfsizlik choralari: Ketma-ket xato urinishlar sababli hisob vaqtincha bloklandi. Iltimos, ${remainingMin} daqiqadan so'ng urinib ko'ring.`,
      });
    }

    const user = await User.scope('withSecrets').findOne({
      where: {
        [Op.or]: [
          { email: rawId },
          { email: identifier },
          { username: rawId },
          { username: identifier },
        ],
      },
      include: [{ model: Clinic, as: 'clinic' }],
    });

    if (!user) {
      trackFailedAttempt(identifier);
      return res.status(401).json({ success: false, message: 'Email, login yoki parol noto\'g\'ri' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ success: false, message: 'Hisobingiz administrator tomonidan vaqtincha bloklangan.' });
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      trackFailedAttempt(identifier);
      return res.status(401).json({ success: false, message: 'Email, login yoki parol noto\'g\'ri' });
    }

    // Login successful: reset failed attempts
    loginAttempts.delete(identifier);

    const { access, refresh } = signTokens(user.id);

    // Save SHA-256 hashed refresh token
    await user.update({ refreshToken: hashRefreshToken(refresh) });

    const userPayload = {
      id: user.id,
      name: user.name,
      username: user.username,
      shortName: user.shortName,
      title: user.title,
      email: user.email,
      role: user.role,
      clinicId: user.clinicId,
      clinic: user.clinic,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      mustChangePassword: Boolean(user.mustChangePassword),
    };

    res.status(200).json({
      success: true,
      token: access,
      refreshToken: refresh,
      data: userPayload,
      mustChangePassword: Boolean(user.mustChangePassword),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

function trackFailedAttempt(identifier) {
  const now = Date.now();
  const current = loginAttempts.get(identifier) || { count: 0, lockedUntil: 0 };
  current.count += 1;
  if (current.count >= MAX_ATTEMPTS) {
    current.lockedUntil = now + LOCKOUT_DURATION;
  }
  loginAttempts.set(identifier, current);
}

// Grace window for concurrent refresh requests (e.g. multiple tabs loading simultaneously)
// userId -> { prevHash, latestTokens: { token, refreshToken }, rotatedAt }
const recentRotations = new Map();
const ROTATION_GRACE_MS = 20 * 1000; // 20 seconds grace window

// Periodic cleanup of stale grace cache
setInterval(() => {
  const cutoff = Date.now() - 60000;
  for (const [uid, record] of recentRotations.entries()) {
    if (record.rotatedAt < cutoff) recentRotations.delete(uid);
  }
}, 60000).unref();

exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ success: false, message: 'Refresh token kiritilmadi' });

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: 'Refresh token muddati tugagan yoki noto\'g\'ri' });
    }

    const user = await User.scope('withSecrets').findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Foydalanuvchi topilmadi' });
    }

    const incomingHash = hashRefreshToken(refreshToken);
    const now = Date.now();

    // 1. Normal rotation: incoming token matches stored hash in database
    if (user.refreshToken && user.refreshToken === incomingHash) {
      const { access, refresh: newRefresh } = signTokens(user.id);
      const newHash = hashRefreshToken(newRefresh);

      // Save to recent rotations for concurrency grace window
      recentRotations.set(user.id, {
        prevHash: incomingHash,
        latestTokens: { token: access, refreshToken: newRefresh },
        rotatedAt: now,
      });

      await user.update({ refreshToken: newHash });
      return res.status(200).json({ success: true, token: access, refreshToken: newRefresh });
    }

    // 2. Check if token matches recently rotated token within grace window (e.g. concurrent tabs)
    const recent = recentRotations.get(user.id);
    if (recent && recent.prevHash === incomingHash) {
      if (now - recent.rotatedAt < ROTATION_GRACE_MS) {
        // Within 20-second grace window: return the newly issued tokens without revoking sessions
        return res.status(200).json({
          success: true,
          token: recent.latestTokens.token,
          refreshToken: recent.latestTokens.refreshToken,
          concurrencyGrace: true,
        });
      } else {
        // Grace window expired! Potential token replay attack
        recentRotations.delete(user.id);
        await user.update({ refreshToken: null });
        return res.status(401).json({
          success: false,
          message: 'Xavfsizlik ogohlantirishi: Eski refresh token grace oynasidan keyin qayta ishlatildi. Barcha sessiyalar bekor qilindi. Qaytadan kiring.',
        });
      }
    }

    // 3. Stored hash mismatch and not in grace cache -> Token theft / invalid token
    await user.update({ refreshToken: null });
    return res.status(401).json({
      success: false,
      message: 'Xavfsizlik ogohlantirishi: Eski yoki noto\'g\'ri refresh token ishlatildi. Barcha sessiyalar bekor qilindi. Qaytadan kiring.',
    });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Refresh token muddati tugagan yoki noto\'g\'ri' });
  }
};

exports.logout = async (req, res) => {
  try {
    if (req.user?.id) {
      recentRotations.delete(req.user.id);
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

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Clinic, as: 'clinic' }],
    });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
    }

    const { name, shortName, phone, avatarUrl, title } = req.body;
    if (name !== undefined) user.name = name;
    if (shortName !== undefined) user.shortName = shortName;
    if (phone !== undefined) user.phone = phone;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (title !== undefined) user.title = title;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profil muvaffaqiyatli yangilandi',
      data: {
        id: user.id,
        name: user.name,
        username: user.username,
        shortName: user.shortName,
        title: user.title,
        email: user.email,
        role: user.role,
        clinicId: user.clinicId,
        clinic: user.clinic,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        isActive: user.isActive,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'Joriy parol va yangi parol kiritilishi shart',
      });
    }

    const user = await User.scope('withSecrets').findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, code: 'USER_NOT_FOUND', message: 'Foydalanuvchi topilmadi' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        code: 'AUTH_CURRENT_PASSWORD_INCORRECT',
        message: 'Joriy parol noto\'g\'ri kiritildi',
      });
    }

    // Strong password policy: at least 8 chars, at least one letter and one number
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        code: 'AUTH_PASSWORD_WEAK',
        message: 'Parol kamida 8 ta belgidan iborat bo\'lishi, kamida bitta harf va bitta raqamni o\'z ichiga olishi shart',
      });
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    user.refreshToken = null; // Invalidate other active sessions
    await user.save();

    // Log to AuditLog
    const { logAudit } = require('../utils/auditLogger');
    await logAudit({
      req,
      action: 'CHANGE_PASSWORD',
      resource: 'user',
      resourceId: user.id,
    });

    const { access, refresh } = signTokens(user.id);
    user.refreshToken = hashRefreshToken(refresh);
    await user.save();

    return res.status(200).json({
      success: true,
      code: 'AUTH_PASSWORD_CHANGED',
      message: 'Parol muvaffaqiyatli yangilandi',
      token: access,
      refreshToken: refresh,
    });
  } catch (err) {
    res.status(500).json({ success: false, code: 'INTERNAL_SERVER_ERROR', message: err.message });
  }
};
