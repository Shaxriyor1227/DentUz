const { Payment, Invoice, Patient, User, sequelize } = require('../models');
const { validatePayment } = require('../validations/paymentValidation');
const { Op } = require('sequelize');
const { getPagination, getPagingData } = require('../utils/pagination');
const { withTenantScope } = require('../utils/tenantScope');
const { notifyPaymentReceived } = require('../services/notificationService');

exports.createPayment = async (req, res) => {
  const { error } = validatePayment(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  const t = await sequelize.transaction();
  try {
    const { invoiceId, patientId, amount, method, notes, receiptNumber } = req.body;
    const paymentAmount = Number(amount);

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      await t.rollback();
      return res.status(400).json({ success: false, message: "Noto'g'ri to'lov summasi" });
    }

    // Check that patient belongs to this clinic
    let targetPatient = null;
    if (patientId) {
      targetPatient = await Patient.findOne({
        where: withTenantScope(req, { id: patientId }),
        transaction: t,
      });
      if (!targetPatient) {
        await t.rollback();
        return res.status(404).json({ success: false, message: 'Bemor topilmadi yoki boshqa klinikaga tegishli' });
      }
    }

    let invoice = null;
    if (invoiceId) {
      // Lock invoice row with transaction.LOCK.UPDATE to prevent race conditions
      invoice = await Invoice.findOne({
        where: withTenantScope(req, { id: invoiceId }),
        lock: t.LOCK.UPDATE,
        transaction: t,
      });

      if (!invoice) {
        await t.rollback();
        return res.status(404).json({ success: false, message: 'Hisob-faktura topilmadi yoki boshqa klinikaga tegishli' });
      }

      const invoiceTotal = Number(invoice.amount || invoice.total || 0);
      const currentPaid = Number(invoice.paidAmount || 0);

      // Ortiqcha to'lov (paidAmount > total) rad etilsin
      if (currentPaid + paymentAmount > invoiceTotal) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: `Ortiqcha to'lov rad etildi. To'lanishi kerak bo'lgan qoldiq: ${invoiceTotal - currentPaid}, kiritilgan summa: ${paymentAmount}`,
        });
      }

      const newPaidAmount = currentPaid + paymentAmount;
      const newStatus = newPaidAmount >= invoiceTotal ? 'paid' : (newPaidAmount > 0 ? 'partial' : 'pending');

      await invoice.update({
        paidAmount: newPaidAmount,
        status: newStatus,
      }, { transaction: t });
    }

    const payment = await Payment.create({
      invoiceId: invoiceId || null,
      patientId: patientId || (invoice ? invoice.patientId : null),
      amount: paymentAmount,
      method: method || 'Naqd',
      notes: notes || null,
      receiptNumber: receiptNumber || `RCP-${Date.now()}`,
      receivedBy: req.user?.id || null,
      clinicId: req.clinicId,
    }, { transaction: t });

    await t.commit();

    // Trigger notification asynchronously
    notifyPaymentReceived(payment, targetPatient, req.clinicId).catch(() => {});

    res.status(201).json({ success: true, data: payment });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const { patientId, invoiceId, method, search, page, limit } = req.query;
    let where = {};
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

    where = withTenantScope(req, where);

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

    const paging = getPagingData({ count, rows }, page, lim);
    res.status(200).json({
      success: true,
      ...paging,
      data: rows,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      where: withTenantScope(req, { id: req.params.id }),
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

    const where = withTenantScope(req, {
      transactionDate: { [Op.between]: [start, end] },
    });

    const totalCollected = await Payment.sum('amount', { where });

    res.status(200).json({
      success: true,
      data: { period, totalCollected: totalCollected || 0 },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updatePayment = async (req, res) => {
  const { error } = validatePayment(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const payment = await Payment.findOne({
      where: withTenantScope(req, { id: req.params.id }),
    });
    if (!payment) return res.status(404).json({ success: false, message: 'To\'lov topilmadi' });

    // Ensure clinicId cannot be changed
    delete req.body.clinicId;
    await payment.update(req.body);
    res.status(200).json({ success: true, data: payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      where: withTenantScope(req, { id: req.params.id }),
    });
    if (!payment) return res.status(404).json({ success: false, message: 'To\'lov topilmadi' });

    await payment.destroy();
    res.status(200).json({ success: true, message: 'To\'lov o\'chirildi' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
