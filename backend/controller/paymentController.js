'use strict';

const { Payment, Invoice, Patient, User } = require('../models');
const { validatePayment } = require('../validations/paymentValidation');
const { Op } = require('sequelize');

const getPagination = (page = 1, limit = 20) => ({
  limit: Math.min(parseInt(limit) || 20, 100),
  offset: (Math.max(parseInt(page) || 1, 1) - 1) * Math.min(parseInt(limit) || 20, 100),
});

exports.createPayment = async (req, res) => {
  const { error } = validatePayment(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const payment = await Payment.create(req.body);

    if (payment.invoiceId) {
      const invoice = await Invoice.findByPk(payment.invoiceId);
      if (invoice) {
        const allPayments = await Payment.findAll({ where: { invoiceId: invoice.id } });
        const totalPaid = allPayments.reduce((sum, p) => sum + Number(p.amount), 0);
        const newStatus = totalPaid >= Number(invoice.amount) ? 'paid'
          : totalPaid > 0 ? 'partial'
          : 'pending';
        await invoice.update({ status: newStatus });
      }
    }

    res.status(201).json({ success: true, data: payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const { patientId, invoiceId, method, search, page, limit } = req.query;
    const where = {};
    const { limit: lim, offset } = getPagination(page, limit);

    if (patientId) where.patientId = patientId;
    if (invoiceId) where.invoiceId = invoiceId;
    if (method)    where.method    = method;

    if (search && search.trim()) {
      const q = search.trim();
      where[Op.or] = [
        { receiptNumber: { [Op.iLike]: `%${q}%` } },
        { notes:         { [Op.iLike]: `%${q}%` } },
      ];
    }

    const { count, rows } = await Payment.findAndCountAll({
      where,
      include: [
        { model: Patient, as: 'patient',  attributes: ['id', 'name', 'phone'] },
        { model: Invoice, as: 'invoice',  attributes: ['id', 'amount', 'status'] },
        { model: User,    as: 'receiver', attributes: ['id', 'name'] },
      ],
      order: [['transactionDate', 'DESC']],
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

exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: Invoice, as: 'invoice' },
        { model: User,    as: 'receiver', attributes: ['id', 'name'] },
      ],
    });
    if (!payment) return res.status(404).json({ success: false, message: 'To\'lov topilmadi' });
    res.status(200).json({ success: true, data: payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPaymentStats = async (req, res) => {
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

    const totalCollected = await Payment.sum('amount', {
      where: { transactionDate: { [Op.between]: [start, end] } },
    });

    res.status(200).json({
      success: true,
      data: { period, totalCollected: totalCollected || 0 },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'To\'lov topilmadi' });

    await payment.destroy();
    res.status(200).json({ success: true, message: 'To\'lov o\'chirildi' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
