/**
 * tenantScope utilities — Helper functions for consistent multi-tenant database scoping.
 */

/**
 * Merges clinicId into Sequelize `where` conditions.
 *
 * @param {object} req - Express request with `req.clinicId` and `req.isSuperAdmin`
 * @param {object} whereClause - Existing Sequelize where conditions
 * @returns {object} Scoped where clause
 */
function withTenantScope(req, whereClause = {}) {
  const scoped = { ...whereClause };

  if (!req.isSuperAdmin) {
    scoped.clinicId = req.clinicId;
  } else if (req.clinicId) {
    scoped.clinicId = req.clinicId;
  }

  return scoped;
}

/**
 * Validates that an entity belongs to the current tenant.
 *
 * @param {object} req - Express request
 * @param {object|string} entityOrClinicId - Sequelize instance or clinicId string
 * @returns {boolean}
 */
function isTenantMatch(req, entityOrClinicId) {
  if (req.isSuperAdmin) return true;
  const clinicId = typeof entityOrClinicId === 'object' && entityOrClinicId !== null
    ? entityOrClinicId.clinicId
    : entityOrClinicId;
  return clinicId === req.clinicId;
}

module.exports = {
  withTenantScope,
  isTenantMatch,
};
