/**
 * Xavfsiz va oson pagination (sahifalash) yordamchisi
 * @param {string|number} page - Sahifa raqami
 * @param {string|number} limit - Sahifadagi elementlar soni
 * @param {number} defaultLimit - Standart limit (defolt: 20)
 * @param {number} maxLimit - Maksimal limit (defolt: 100)
 */
const getPagination = (page = 1, limit = 20, defaultLimit = 20, maxLimit = 100) => {
  const pageNumber = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(maxLimit, Math.max(1, parseInt(limit, 10) || defaultLimit));
  const offset = (pageNumber - 1) * pageSize;

  return {
    page: pageNumber,
    limit: pageSize,
    offset,
  };
};

/**
 * Sahifalash natijasini chiroyli va qulay formatda shakllantirish
 */
const getPagingData = (data, page, limit) => {
  const { count: total, rows: items } = data;
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    items,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

module.exports = {
  getPagination,
  getPagingData,
};
