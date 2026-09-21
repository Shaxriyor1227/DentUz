'use strict';

const { Inventory } = require('../models');
const { validateInventory } = require('../validations/inventoryValidation');
const { Op } = require('sequelize');

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getPagination = (page = 1, limit = 20) => ({
  limit: Math.min(parseInt(limit) || 20, 100),
  offset: (Math.max(parseInt(page) || 1, 1) - 1) * Math.min(parseInt(limit) || 20, 100),
});

// ─── CREATE ───────────────────────────────────────────────────────────────────
exports.createInventory = async (req, res) => {
  const { error } = validateInventory(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const item = await Inventory.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET ALL ──────────────────────────────────────────────────────────────────
exports.getInventories = async (req, res) => {
  try {
    const { category, lowStock, search, page, limit } = req.query;
    const where = {};
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

    const { count, rows } = await Inventory.findAndCountAll({
      where,
      order: [['name', 'ASC']],
      limit: lim,
      offset,
    });

    // Apply lowStock filter after fetching (in-memory — quantity field based)
    const data = lowStock === 'true'
      ? rows.filter((item) => item.quantity <= item.minQuantity)
      : rows;

    res.status(200).json({
      success: true,
      total: count,
      page: Math.max(parseInt(page) || 1, 1),
      limit: lim,
      data,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET BY ID ────────────────────────────────────────────────────────────────
exports.getInventoryById = async (req, res) => {
  try {
    const item = await Inventory.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Mahsulot topilmadi' });
    res.status(200).json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────
exports.updateInventory = async (req, res) => {
  const { error } = validateInventory(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const item = await Inventory.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Mahsulot topilmadi' });

    await item.update(req.body);
    res.status(200).json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADJUST QUANTITY ─────────────────────────────────────────────────────────
exports.adjustQuantity = async (req, res) => {
  try {
    const { delta } = req.body;
    if (typeof delta !== 'number') {
      return res.status(400).json({ success: false, message: 'Delta raqam bo\'lishi shart' });
    }

    const item = await Inventory.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Mahsulot topilmadi' });

    const newQuantity = Math.max(0, item.quantity + delta);
    await item.update({ quantity: newQuantity });

    res.status(200).json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────
exports.deleteInventory = async (req, res) => {
  try {
    const item = await Inventory.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Mahsulot topilmadi' });

    const data = item.toJSON();
    await item.destroy();
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
