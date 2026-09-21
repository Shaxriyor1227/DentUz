'use strict';

const { TreatmentPlan, Patient, Doctor } = require('../models');
const { validateTreatmentPlan } = require('../validations/treatmentPlanValidation');
const { Op } = require('sequelize');

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getPagination = (page = 1, limit = 20) => ({
  limit: Math.min(parseInt(limit) || 20, 100),
  offset: (Math.max(parseInt(page) || 1, 1) - 1) * Math.min(parseInt(limit) || 20, 100),
});

// ─── CREATE ───────────────────────────────────────────────────────────────────
exports.createTreatmentPlan = async (req, res) => {
  const { error } = validateTreatmentPlan(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const data = { ...req.body, id: req.body.id || `TR-${Date.now()}` };
    const plan = await TreatmentPlan.create(data);
    res.status(201).json({ success: true, data: plan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET ALL ──────────────────────────────────────────────────────────────────
exports.getTreatmentPlans = async (req, res) => {
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
        { title:     { [Op.iLike]: `%${q}%` } },
        { diagnosis: { [Op.iLike]: `%${q}%` } },
        { notes:     { [Op.iLike]: `%${q}%` } },
      ];
    }

    const { count, rows } = await TreatmentPlan.findAndCountAll({
      where,
      include: [
        { model: Patient, as: 'patient', attributes: ['id', 'name', 'phone'] },
        { model: Doctor,  as: 'doctor',  attributes: ['id', 'specialization'] },
      ],
      order: [['createdAt', 'DESC']],
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
exports.getTreatmentPlanById = async (req, res) => {
  try {
    const plan = await TreatmentPlan.findByPk(req.params.id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: Doctor,  as: 'doctor'  },
      ],
    });
    if (!plan) return res.status(404).json({ success: false, message: 'Davolash rejasi topilmadi' });
    res.status(200).json({ success: true, data: plan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────
exports.updateTreatmentPlan = async (req, res) => {
  const { error } = validateTreatmentPlan(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const plan = await TreatmentPlan.findByPk(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Davolash rejasi topilmadi' });

    await plan.update(req.body);
    res.status(200).json({ success: true, data: plan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────
exports.deleteTreatmentPlan = async (req, res) => {
  try {
    const plan = await TreatmentPlan.findByPk(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Davolash rejasi topilmadi' });

    await plan.destroy();
    res.status(200).json({ success: true, message: 'Davolash rejasi o\'chirildi' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
