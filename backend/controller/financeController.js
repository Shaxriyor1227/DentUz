'use strict';

const { Invoice, Patient, Clinic } = require('../models');
const { validateInvoice } = require('../validations/invoiceValidation');
const { Op } = require('sequelize');

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getPagination = (page = 1, limit = 20) => ({
  limit: Math.min(parseInt(limit) || 20, 100),
  offset: (Math.max(parseInt(page) || 1, 1) - 1) * Math.min(parseInt(limit) || 20, 100),
});

// ─── CREATE ───────────────────────────────────────────────────────────────────
exports.createInvoice = async (req, res) => {
  const { error } = validateInvoice(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const invoice = await Invoice.create(req.body);
    res.status(201).json({ success: true, data: invoice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET ALL ──────────────────────────────────────────────────────────────────
exports.getInvoices = async (req, res) => {
  try {
    const { status, patientId, search, page, limit } = req.query;
    const where = {};
    const { limit: lim, offset } = getPagination(page, limit);

    if (status)    where.status    = status;
    if (patientId) where.patientId = patientId;

    if (search && search.trim()) {
      const q = search.trim();
      where[Op.or] = [
        { patient:   { [Op.iLike]: `%${q}%` } },
        { doctor:    { [Op.iLike]: `%${q}%` } },
        { procedure: { [Op.iLike]: `%${q}%` } },
      ];
    }

    const { count, rows } = await Invoice.findAndCountAll({
      where,
      include: [{ model: Patient, as: 'patientRecord' }],
      order: [['date', 'DESC']],
      limit: lim,
      offset,
    });

    res.status(200).json({
      success: true,
      total: count,
      page: Math.max(parseInt(page) || 1, 1),
      limit: lim,
      data: rows,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET BY ID ────────────────────────────────────────────────────────────────
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        { model: Patient, as: 'patientRecord' },
        { model: Clinic,  as: 'clinic'        },
      ],
    });
    if (!invoice) return res.status(404).json({ success: false, message: 'Hisob-faktura topilmadi' });
    res.status(200).json({ success: true, data: invoice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────
exports.updateInvoice = async (req, res) => {
  const { error } = validateInvoice(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Hisob-faktura topilmadi' });

    await invoice.update(req.body);
    res.status(200).json({ success: true, data: invoice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Hisob-faktura topilmadi' });

    const data = invoice.toJSON();
    await invoice.destroy();
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── SEARCH ───────────────────────────────────────────────────────────────────
exports.searchInvoice = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ success: false, message: 'Qidiruv so\'zi kiritilmadi' });

    const invoices = await Invoice.findAll({
      where: {
        [Op.or]: [
          { patient:   { [Op.iLike]: `%${query}%` } },
          { doctor:    { [Op.iLike]: `%${query}%` } },
          { procedure: { [Op.iLike]: `%${query}%` } },
        ],
      },
      include: [{ model: Patient, as: 'patientRecord' }],
      limit: 50,
    });

    res.status(200).json({ success: true, data: invoices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── STATS ────────────────────────────────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const { period = 'this_month' } = req.query;
    const now = new Date();
    let start, end;

    if (period === 'this_month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else if (period === 'last_month') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else {
      start = new Date(now - 30 * 24 * 60 * 60 * 1000);
      end   = now;
    }

    const baseWhere = { date: { [Op.between]: [start, end] } };

    const [paidSum, pendingSum, pendingCount] = await Promise.all([
      Invoice.sum('amount', { where: { ...baseWhere, status: 'paid' } }),
      Invoice.sum('amount', { where: { ...baseWhere, status: { [Op.in]: ['pending', 'partial'] } } }),
      Invoice.count({ where: { ...baseWhere, status: { [Op.in]: ['pending', 'partial'] } } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        monthlyRevenue:  paidSum    || 0,
        pendingPayments: pendingSum || 0,
        pendingCount:    pendingCount || 0,
        expenses:        0,
        netProfit:       paidSum    || 0,
        label:           period,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── UPDATE STATUS ────────────────────────────────────────────────────────────
exports.updateStatus = async (req, res) => {
  try {
    const inv = await Invoice.findByPk(req.params.id);
    if (!inv) return res.status(404).json({ success: false, message: 'Hisob-faktura topilmadi' });

    await inv.update({ status: req.body.status });
    res.status(200).json({ success: true, data: inv });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
