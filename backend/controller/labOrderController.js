'use strict';

const { LabOrder, Patient, Doctor } = require('../models');
const { validateLabOrder } = require('../validations/labOrderValidation');
const { Op } = require('sequelize');

const getPagination = (page = 1, limit = 20) => ({
  limit: Math.min(parseInt(limit) || 20, 100),
  offset: (Math.max(parseInt(page) || 1, 1) - 1) * Math.min(parseInt(limit) || 20, 100),
});

exports.createLabOrder = async (req, res) => {
  const { error } = validateLabOrder(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const order = await LabOrder.create(req.body);
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getLabOrders = async (req, res) => {
  try {
    const { patientId, doctorId, status, search, page, limit } = req.query;
    const where = {};
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

exports.getLabOrderById = async (req, res) => {
  try {
    const order = await LabOrder.findByPk(req.params.id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: Doctor,  as: 'doctor'  },
      ],
    });
    if (!order) return res.status(404).json({ success: false, message: 'Lab buyurtmasi topilmadi' });
    res.status(200).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateLabOrder = async (req, res) => {
  const { error } = validateLabOrder(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const order = await LabOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Lab buyurtmasi topilmadi' });

    await order.update(req.body);
    res.status(200).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteLabOrder = async (req, res) => {
  try {
    const order = await LabOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Lab buyurtmasi topilmadi' });

    await order.destroy();
    res.status(200).json({ success: true, message: 'Lab buyurtmasi o\'chirildi' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
