const { Patient, Appointment, Invoice, Odontogram } = require('../models');
const { validatePatient } = require('../validations/patientValidation');
const { Op } = require('sequelize');
const { getPagination, getPagingData } = require('../utils/pagination');
const { withTenantScope } = require('../utils/tenantScope');
const { notifyPatientCreated } = require('../services/notificationService');

exports.createPatient = async (req, res) => {
  const { error } = validatePatient(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const payload = { ...req.body };
    if (!payload.id) {
      payload.id = `P-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;
    }
    payload.clinicId = req.clinicId;

    const patient = await Patient.create(payload);

    // Asynchronously create system notification
    notifyPatientCreated(patient, req.clinicId).catch(() => {});

    res.status(201).json({ success: true, data: patient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPatients = async (req, res) => {
  try {
    const { search, status, filter, page, limit } = req.query;
    const activeFilter = filter || status;
    let where = {};
    const { limit: lim, offset } = getPagination(page, limit);

    if (activeFilter && activeFilter !== 'all') {
      if (activeFilter === 'debtor') {
        where[Op.or] = [
          { status: 'debtor' },
          { balance: { [Op.lt]: 0 } },
        ];
      } else {
        where.status = activeFilter;
      }
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

    where = withTenantScope(req, where);

    // High-performance single-pass conditional aggregation
    const clinicId = req.clinicId;
    const countsResult = await Patient.sequelize.query(`
      SELECT
        COUNT(*)::int AS "all",
        COUNT(*) FILTER (WHERE status = 'today')::int AS "today",
        COUNT(*) FILTER (WHERE status = 'scheduled')::int AS "scheduled",
        COUNT(*) FILTER (WHERE status = 'debtor' OR balance < 0)::int AS "debtor"
      FROM "patients"
      WHERE "clinicId" = :clinicId
        AND "deletedAt" IS NULL
    `, {
      replacements: { clinicId },
      type: Patient.sequelize.QueryTypes.SELECT,
    });

    const countsRow = countsResult?.[0] || countsResult || {};
    const allCount = Number(countsRow.all || 0);
    const todayCount = Number(countsRow.today || 0);
    const scheduledCount = Number(countsRow.scheduled || 0);
    const debtorCount = Number(countsRow.debtor || 0);

    const { count, rows } = await Patient.findAndCountAll({
      where,
      distinct: true,
      order: [['createdAt', 'DESC']],
      limit: lim,
      offset,
    });

    const paging = getPagingData({ count, rows }, page, lim);
    res.status(200).json({
      success: true,
      ...paging,
      counts: {
        all: allCount,
        today: todayCount,
        scheduled: scheduledCount,
        debtor: debtorCount,
      },
      allTotalCount: allCount,
      items: rows,
      data: rows,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPatientById = async (req, res) => {
  try {
    const rawId = req.params.id;
    const possibleIds = [rawId, rawId.startsWith('P-') ? rawId.slice(2) : `P-${rawId}`];

    const where = withTenantScope(req, {
      id: { [Op.in]: possibleIds },
    });

    const patient = await Patient.findOne({
      where,
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
    const rawId = req.params.id;
    const possibleIds = [rawId, rawId.startsWith('P-') ? rawId.slice(2) : `P-${rawId}`];

    const patient = await Patient.findOne({
      where: withTenantScope(req, { id: { [Op.in]: possibleIds } }),
    });
    if (!patient) return res.status(404).json({ success: false, message: 'Bemor topilmadi' });

    delete req.body.clinicId;
    await patient.update(req.body);
    res.status(200).json({ success: true, data: patient });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deletePatient = async (req, res) => {
  try {
    const rawId = req.params.id;
    const possibleIds = [rawId, rawId.startsWith('P-') ? rawId.slice(2) : `P-${rawId}`];

    const patient = await Patient.findOne({
      where: withTenantScope(req, { id: { [Op.in]: possibleIds } }),
    });
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

    let where = {
      [Op.or]: [
        { name: { [Op.iLike]: `%${query}%` } },
        { phone: { [Op.iLike]: `%${query}%` } },
        { id: { [Op.iLike]: `%${query}%` } },
      ],
    };
    where = withTenantScope(req, where);

    const patients = await Patient.findAll({
      where,
      limit: 50,
    });

    res.status(200).json({ success: true, data: patients });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
