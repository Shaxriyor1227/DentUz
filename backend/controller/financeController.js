'use strict';

const { Op, fn, col, literal } = require('sequelize');
const { Invoice, sequelize } = require('../models');

/**
 * GET /api/finance/stats?period=this_month|last_month|custom
 * Returns aggregate KPI matching frontend financeApi shape
 */
exports.getStats = async (req, res, next) => {
  try {
    const { period = 'this_month' } = req.query;
    const clinicId = req.user.clinicId;

    const now = new Date();
    let start, end;

    if (period === 'this_month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else if (period === 'last_month') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else {
      // custom: return last 30 days by default
      start = new Date(now - 30 * 24 * 60 * 60 * 1000);
      end = now;
    }

    const baseWhere = { clinicId, date: { [Op.between]: [start, end] } };

    const [paidSum, pendingSum, pendingCount] = await Promise.all([
      Invoice.sum('amount', { where: { ...baseWhere, status: 'paid' } }),
      Invoice.sum('amount', { where: { ...baseWhere, status: { [Op.in]: ['pending', 'partial'] } } }),
      Invoice.count({ where: { ...baseWhere, status: { [Op.in]: ['pending', 'partial'] } } }),
    ]);

    res.json({
      success: true,
      stats: {
        monthlyRevenue: paidSum || 0,
        pendingPayments: pendingSum || 0,
        pendingCount: pendingCount || 0,
        // expenses & growth metrics require Expense model (future)
        expenses: 0,
        netProfit: paidSum || 0,
        label: period,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/finance/invoices?period=this_month|last_month|custom
 */
exports.getInvoices = async (req, res, next) => {
  try {
    const { period = 'this_month' } = req.query;
    const clinicId = req.user.clinicId;
    const now = new Date();
    let start, end;

    if (period === 'this_month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else if (period === 'last_month') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else {
      start = new Date(now - 30 * 24 * 60 * 60 * 1000);
      end = now;
    }

    const invoices = await Invoice.findAll({
      where: { clinicId, date: { [Op.between]: [start, end] } },
      order: [['date', 'DESC']],
    });

    res.json({ success: true, invoices });
  } catch (err) {
    next(err);
  }
};

/** POST /api/finance/invoices */
exports.createInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.create({ ...req.body, clinicId: req.user.clinicId });
    res.status(201).json({ success: true, invoice });
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/finance/invoices/:id/status */
exports.updateStatus = async (req, res, next) => {
  try {
    const inv = await Invoice.findOne({ where: { id: req.params.id, clinicId: req.user.clinicId } });
    if (!inv) return res.status(404).json({ success: false, message: 'Hisob-faktura topilmadi' });
    await inv.update({ status: req.body.status });
    res.json({ success: true, invoice: inv });
  } catch (err) {
    next(err);
  }
};
