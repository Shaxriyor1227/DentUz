const { AuditLog } = require('../models');
const { Op } = require('sequelize');
const { withTenantScope } = require('../utils/tenantScope');
const { getPagination, getPagingData } = require('../utils/pagination');

exports.getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, action, resource, search, startDate, endDate } = req.query;
    const { limit: lim, offset } = getPagination(page, limit);

    let where = {};

    if (action) {
      where.action = action;
    }

    if (resource) {
      where.resource = resource;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt[Op.lte] = end;
      }
    }

    if (search && search.trim()) {
      const q = search.trim();
      where[Op.or] = [
        { userEmail: { [Op.iLike]: `%${q}%` } },
        { userRole: { [Op.iLike]: `%${q}%` } },
        { action: { [Op.iLike]: `%${q}%` } },
        { resource: { [Op.iLike]: `%${q}%` } },
        { ip: { [Op.iLike]: `%${q}%` } },
      ];
    }

    // Tenant scoping: strictly within this clinic (or all if superadmin)
    where = withTenantScope(req, where);

    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: lim,
      offset,
    });

    const paging = getPagingData({ count, rows }, page, lim);

    return res.status(200).json({
      success: true,
      ...paging,
      data: rows,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
