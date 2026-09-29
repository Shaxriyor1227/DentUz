/**
 * tenantMiddleware — Enforces multi-tenant data isolation.
 *
 * Must be executed AFTER `authenticate` middleware.
 * - For regular clinic users (owner, doctor, administrator, accountant, nurse, receptionist):
 *   Extracts `clinicId` strictly from `req.user.clinicId`.
 *   Rejects with 403 if `clinicId` is missing on the user.
 *   Sanitizes `req.body.clinicId` to prevent tenant spoofing.
 * - For SuperAdmin:
 *   Allows optional `clinicId` query param for cross-clinic inspection/filtering.
 */
const tenantMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Autentifikatsiya talab etiladi' });
  }

  // SuperAdmin: Can inspect any clinic or filter by query param clinicId
  if (req.user.role === 'superadmin') {
    req.clinicId = req.query.clinicId || null;
    req.isSuperAdmin = true;
    return next();
  }

  // Regular tenant user MUST have a clinicId
  if (!req.user.clinicId) {
    return res.status(403).json({
      success: false,
      message: 'Foydalanuvchiga biriktirilgan klinika topilmadi (Tenant isolation ruxsatnomasi yo\'q)'
    });
  }

  // Enforce clinicId strictly from user token/session
  req.clinicId = req.user.clinicId;
  req.isSuperAdmin = false;

  // Never allow user to overwrite or spoof clinicId via request body or query
  if (req.body && typeof req.body === 'object') {
    req.body.clinicId = req.clinicId;
  }
  if (req.query && typeof req.query === 'object') {
    req.query.clinicId = req.clinicId;
  }

  next();
};

module.exports = { tenantMiddleware };
