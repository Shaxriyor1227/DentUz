const { AuditLog } = require('../models');

/**
 * auditLogger — Records security and compliance audit logs.
 * Sensitive fields (passwords, tokens, medical complaints/diagnosis text) are NEVER logged.
 */
async function recordAuditLog({ req, action, resource, resourceId, metadata = {} }) {
  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip || req.socket?.remoteAddress;
    const userAgent = req.headers['user-agent'] || null;

    // Sanitize metadata to strip any potential secrets
    const safeMetadata = { ...metadata };
    delete safeMetadata.password;
    delete safeMetadata.token;
    delete safeMetadata.refreshToken;
    delete safeMetadata.complaints;
    delete safeMetadata.diagnosis;
    delete safeMetadata.treatmentDone;

    await AuditLog.create({
      clinicId: req.clinicId || req.user?.clinicId || null,
      userId: req.user?.id || null,
      userEmail: req.user?.email || null,
      userRole: req.user?.role || null,
      action: action.toUpperCase(),
      resource,
      resourceId: resourceId ? String(resourceId) : null,
      ip,
      userAgent,
      metadata: safeMetadata,
    });
  } catch (err) {
    // Audit logging failure should not crash the request, but should be logged to stderr
    console.error('AuditLog yozishda xatolik:', err.message);
  }
}

module.exports = { recordAuditLog };
