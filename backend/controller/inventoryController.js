const { Inventory, sequelize } = require('../models');
const { validateInventory } = require('../validations/inventoryValidation');
const { Op } = require('sequelize');
const { getPagination, getPagingData } = require('../utils/pagination');
const { withTenantScope } = require('../utils/tenantScope');
const { notifyLowStock } = require('../services/notificationService');

exports.createInventory = async (req, res) => {
  const { error } = validateInventory(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const item = await Inventory.create({
      ...req.body,
      clinicId: req.clinicId,
    });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getInventories = async (req, res) => {
  try {
    const { category, lowStock, search, page, limit } = req.query;
    let where = {};
    const { limit: lim, offset } = getPagination(page, limit);

    if (category) where.category = category;

    if (search && search.trim()) {
      const q = search.trim();
      where[Op.or] = [
        { name:     { [Op.iLike]: `%${q}%` } },
        { sku:      { [Op.iLike]: `%${q}%` } },
        { supplier: { [Op.iLike]: `%${q}%` } },
      ];
    }

    where = withTenantScope(req, where);

    const { count, rows } = await Inventory.findAndCountAll({
      where,
      order: [['name', 'ASC']],
      limit: lim,
      offset,
    });

    const data = lowStock === 'true'
      ? rows.filter((item) => Number(item.quantity) <= Number(item.minQuantity))
      : rows;

    const paging = getPagingData({ count, rows }, page, lim);
    res.status(200).json({
      success: true,
      ...paging,
      data,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getInventoryById = async (req, res) => {
  try {
    const item = await Inventory.findOne({
      where: withTenantScope(req, { id: req.params.id }),
    });
    if (!item) return res.status(404).json({ success: false, message: 'Mahsulot topilmadi' });
    res.status(200).json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateInventory = async (req, res) => {
  const { error } = validateInventory(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const item = await Inventory.findOne({
      where: withTenantScope(req, { id: req.params.id }),
    });
    if (!item) return res.status(404).json({ success: false, message: 'Mahsulot topilmadi' });

    delete req.body.clinicId;
    await item.update(req.body);
    res.status(200).json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * adjustQuantity: Atomic increment/decrement under transaction with row locking
 * Ensures quantity cannot drop below 0.
 */
exports.adjustQuantity = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const delta = Number(req.body.delta !== undefined ? req.body.delta : req.body.quantity);
    if (isNaN(delta)) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Delta raqam bo\'lishi shart' });
    }

    const item = await Inventory.findOne({
      where: withTenantScope(req, { id: req.params.id }),
      lock: t.LOCK.UPDATE,
      transaction: t,
    });

    if (!item) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Mahsulot topilmadi' });
    }

    const currentQty = Number(item.quantity || 0);
    if (currentQty + delta < 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: `Ombor qoldig'i yetarli emas. Hozirgi qoldiq: ${currentQty}, o'zgarish: ${delta}`,
      });
    }

    // Atomic increment/decrement
    await item.increment('quantity', { by: delta, transaction: t });
    await item.reload({ transaction: t });

    await t.commit();

    if (Number(item.quantity) <= Number(item.minQuantity)) {
      notifyLowStock(item, req.clinicId).catch(() => {});
    }

    res.status(200).json({ success: true, data: item });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.searchInventory = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ success: false, message: 'Qidiruv so\'zi kiritilmadi' });

    let where = {
      [Op.or]: [
        { name:     { [Op.iLike]: `%${query}%` } },
        { sku:      { [Op.iLike]: `%${query}%` } },
        { supplier: { [Op.iLike]: `%${query}%` } },
      ],
    };
    where = withTenantScope(req, where);

    const items = await Inventory.findAll({
      where,
      limit: 50,
    });

    res.status(200).json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteInventory = async (req, res) => {
  try {
    const item = await Inventory.findOne({
      where: withTenantScope(req, { id: req.params.id }),
    });
    if (!item) return res.status(404).json({ success: false, message: 'Mahsulot topilmadi' });

    const data = item.toJSON();
    await item.destroy();
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
