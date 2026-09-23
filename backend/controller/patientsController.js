
const { Patient, Appointment, Invoice, Odontogram } = require('../models');
const { validatePatient } = require('../validations/patientValidation');
const { Op } = require('sequelize');
const { getPagination, getPagingData } = require('../utils/pagination');

exports.createPatient = async (req, res) => {
  const { error } = validatePatient(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const patient = await Patient.create(req.body);
    res.status(201).json({ success: true, data: patient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPatients = async (req, res) => {
  try {
    const { search, status, page, limit } = req.query;
    const where = {};
    const { limit: lim, offset } = getPagination(page, limit);

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where[Op.or] = [
        { name: { [Op.iLike]: `%${q}%` } },
        { phone: { [Op.iLike]: `%${q}%` } },
        { id: { [Op.iLike]: `%${q}%` } },
        { lastProcedure: { [Op.iLike]: `%${q}%` } },
      ];
    }

    const { count, rows } = await Patient.findAndCountAll({
      where,
      include: [
        { model: Appointment, as: 'appointments' },
        { model: Odontogram, as: 'odontogram' },
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

exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id, {
      include: [
        { model: Appointment, as: 'appointments' },
        { model: Invoice, as: 'invoices' },
        { model: Odontogram, as: 'odontogram' },
      ],
    });
    if (!patient) return res.status(404).json({ success: false, message: 'Bemor topilmadi' });
    res.status(200).json({ success: true, data: patient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updatePatient = async (req, res) => {
  const { error } = validatePatient(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: 'Bemor topilmadi' });

    await patient.update(req.body);
    res.status(200).json({ success: true, data: patient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: 'Bemor topilmadi' });

    const data = patient.toJSON();
    await patient.destroy();
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.searchPatient = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ success: false, message: 'Qidiruv so\'zi kiritilmadi' });

    const patients = await Patient.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { phone: { [Op.iLike]: `%${query}%` } },
          { id: { [Op.iLike]: `%${query}%` } },
        ],
      },
      limit: 50,
    });

    res.status(200).json({ success: true, data: patients });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
