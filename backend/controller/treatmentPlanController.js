
const { TreatmentPlan, Patient, Doctor } = require('../models');
const { validateTreatmentPlan } = require('../validations/treatmentPlanValidation');
const { Op } = require('sequelize');
const { getPagination, getPagingData } = require('../utils/pagination');

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

exports.searchTreatmentPlan = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ success: false, message: 'Qidiruv so\'zi kiritilmadi' });

    const plans = await TreatmentPlan.findAll({
      where: {
        [Op.or]: [
          { title:     { [Op.iLike]: `%${query}%` } },
          { diagnosis: { [Op.iLike]: `%${query}%` } },
          { notes:     { [Op.iLike]: `%${query}%` } },
        ],
      },
      include: [
        { model: Patient, as: 'patient' },
        { model: Doctor,  as: 'doctor'  },
      ],
      limit: 50,
    });

    res.status(200).json({ success: true, data: plans });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

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
