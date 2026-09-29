const { LabOrder, Patient, Doctor } = require('../models');
const { validateLabOrder } = require('../validations/labOrderValidation');
const { Op } = require('sequelize');
const { getPagination, getPagingData } = require('../utils/pagination');
const { withTenantScope } = require('../utils/tenantScope');
const { notifyLabOrderReady } = require('../services/notificationService');

exports.createLabOrder = async (req, res) => {
  const { error } = validateLabOrder(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const { patientId, doctorId } = req.body;
    if (patientId) {
      const patient = await Patient.findOne({
        where: withTenantScope(req, { id: patientId }),
      });
      if (!patient) {
        return res.status(404).json({ success: false, message: 'Bemor topilmadi yoki ushbu klinikaga tegishli emas' });
      }
    }

    if (doctorId) {
      const doctor = await Doctor.findOne({
        where: withTenantScope(req, { id: doctorId }),
      });
      if (!doctor) {
        return res.status(404).json({ success: false, message: 'Shifokor topilmadi yoki ushbu klinikaga tegishli emas' });
      }
    }

    const order = await LabOrder.create({
      ...req.body,
      clinicId: req.clinicId,
    });
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getLabOrders = async (req, res) => {
  try {
    const { patientId, doctorId, status, search, page, limit } = req.query;
    let where = {};
    const { limit: lim, offset } = getPagination(page, limit);

    if (patientId) where.patientId = patientId;
    if (doctorId)  where.doctorId  = doctorId;
    if (status)    where.status    = status;

    if (search && search.trim()) {
      const q = search.trim();
      where[Op.or] = [
        { orderNumber:   { [Op.iLike]: `%${q}%` } },
        { technicianName:{ [Op.iLike]: `%${q}%` } },
        { toothNumber:   { [Op.iLike]: `%${q}%` } },
        { notes:         { [Op.iLike]: `%${q}%` } },
      ];
    }

    where = withTenantScope(req, where);

    const { count, rows } = await LabOrder.findAndCountAll({
      where,
      include: [
        { model: Patient, as: 'patient', attributes: ['id', 'name', 'phone'] },
        { model: Doctor,  as: 'doctor',  attributes: ['id', 'specialization'] },
      ],
      order: [['sentDate', 'DESC']],
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

exports.searchLabOrder = async (req, res) => {
  req.query.search = req.query.query || req.query.search || '';
  return exports.getLabOrders(req, res);
};


exports.getLabOrderById = async (req, res) => {
  try {
    const order = await LabOrder.findOne({
      where: withTenantScope(req, { id: req.params.id }),
      include: [
        { model: Patient, as: 'patient' },
        { model: Doctor,  as: 'doctor'  },
      ],
    });
    if (!order) return res.status(404).json({ success: false, message: 'Laboratoriya buyurtmasi topilmadi' });
    res.status(200).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateLabOrder = async (req, res) => {
  const { error } = validateLabOrder(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const order = await LabOrder.findOne({
      where: withTenantScope(req, { id: req.params.id }),
    });
    if (!order) return res.status(404).json({ success: false, message: 'Laboratoriya buyurtmasi topilmadi' });

    delete req.body.clinicId;
    const oldStatus = order.status;
    await order.update(req.body);

    if (['completed', 'ready', 'delivered'].includes(req.body.status) && oldStatus !== req.body.status) {
      const patient = await Patient.findOne({ where: withTenantScope(req, { id: order.patientId }) });
      notifyLabOrderReady(order, patient, req.clinicId).catch(() => {});
    }

    res.status(200).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteLabOrder = async (req, res) => {
  try {
    const order = await LabOrder.findOne({
      where: withTenantScope(req, { id: req.params.id }),
    });
    if (!order) return res.status(404).json({ success: false, message: 'Laboratoriya buyurtmasi topilmadi' });

    await order.destroy();
    res.status(200).json({ success: true, message: 'Laboratoriya buyurtmasi o\'chirildi' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
