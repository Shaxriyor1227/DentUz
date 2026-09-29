const { TreatmentPlan, Patient, Doctor } = require('../models');
const { validateTreatmentPlan } = require('../validations/treatmentPlanValidation');
const { Op } = require('sequelize');
const { getPagination, getPagingData } = require('../utils/pagination');
const { withTenantScope } = require('../utils/tenantScope');

exports.createTreatmentPlan = async (req, res) => {
  const { error } = validateTreatmentPlan(req.body);
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

    const data = {
      ...req.body,
      id: req.body.id || `TR-${Date.now()}`,
      clinicId: req.clinicId,
    };

    const plan = await TreatmentPlan.create(data);
    res.status(201).json({ success: true, data: plan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTreatmentPlans = async (req, res) => {
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
        { title:     { [Op.iLike]: `%${q}%` } },
        { diagnosis: { [Op.iLike]: `%${q}%` } },
        { notes:     { [Op.iLike]: `%${q}%` } },
      ];
    }

    where = withTenantScope(req, where);

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

exports.searchTreatmentPlan = async (req, res) => {
  req.query.search = req.query.query || req.query.search || '';
  return exports.getTreatmentPlans(req, res);
};


exports.getTreatmentPlanById = async (req, res) => {
  try {
    const plan = await TreatmentPlan.findOne({
      where: withTenantScope(req, { id: req.params.id }),
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
    const plan = await TreatmentPlan.findOne({
      where: withTenantScope(req, { id: req.params.id }),
    });
    if (!plan) return res.status(404).json({ success: false, message: 'Davolash rejasi topilmadi' });

    delete req.body.clinicId;
    await plan.update(req.body);
    res.status(200).json({ success: true, data: plan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteTreatmentPlan = async (req, res) => {
  try {
    const plan = await TreatmentPlan.findOne({
      where: withTenantScope(req, { id: req.params.id }),
    });
    if (!plan) return res.status(404).json({ success: false, message: 'Davolash rejasi topilmadi' });

    await plan.destroy();
    res.status(200).json({ success: true, message: 'Davolash rejasi o\'chirildi' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
