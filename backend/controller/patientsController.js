'use strict';

const { Op } = require('sequelize');
const { Patient } = require('../models');

/**
 * GET /api/patients
 * Query: { search, filter, page, pageSize }
 * Returns paginated list matching frontend patientsApi shape
 */
exports.getAll = async (req, res, next) => {
  try {
    const { search = '', filter = 'all', page = 1, pageSize = 30 } = req.query;
    const limit = parseInt(pageSize, 10) || 30;
    const offset = (parseInt(page, 10) - 1) * limit;

    const where = { clinicId: req.user.clinicId };

    if (search.trim()) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
        { id: { [Op.iLike]: `%${search}%` } },
        { lastProcedure: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (filter === 'today') where.status = 'today';
    else if (filter === 'scheduled') where.status = 'scheduled';
    else if (filter === 'debtor') {
      where[Op.or] = [{ status: 'debtor' }, { balance: { [Op.gt]: 0 } }];
    }

    const { count, rows } = await Patient.findAndCountAll({ where, limit, offset, order: [['createdAt', 'DESC']] });

    // Count badges (match frontend counts shape)
    const [allCount, todayCount, scheduledCount, debtorCount] = await Promise.all([
      Patient.count({ where: { clinicId: req.user.clinicId } }),
      Patient.count({ where: { clinicId: req.user.clinicId, status: 'today' } }),
      Patient.count({ where: { clinicId: req.user.clinicId, status: 'scheduled' } }),
      Patient.count({ where: { clinicId: req.user.clinicId, balance: { [Op.gt]: 0 } } }),
    ]);

    res.json({
      success: true,
      items: rows,
      total: count,
      fullFilteredCount: count,
      page: parseInt(page, 10),
      pageSize: limit,
      allTotalCount: allCount,
      counts: { all: allCount, today: todayCount, scheduled: scheduledCount, debtor: debtorCount },
    });
  } catch (err) {
    next(err);
  }
};

/** GET /api/patients/:id */
exports.getById = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({
      where: { id: req.params.id, clinicId: req.user.clinicId },
    });
    if (!patient) return res.status(404).json({ success: false, message: 'Bemor topilmadi' });
    res.json({ success: true, patient });
  } catch (err) {
    next(err);
  }
};

/** POST /api/patients */
exports.create = async (req, res, next) => {
  try {
    const data = { ...req.body, clinicId: req.user.clinicId };
    const patient = await Patient.create(data);
    res.status(201).json({ success: true, patient });
  } catch (err) {
    next(err);
  }
};

/** PUT /api/patients/:id */
exports.update = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({
      where: { id: req.params.id, clinicId: req.user.clinicId },
    });
    if (!patient) return res.status(404).json({ success: false, message: 'Bemor topilmadi' });
    await patient.update(req.body);
    res.json({ success: true, patient });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/patients/:id */
exports.remove = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({
      where: { id: req.params.id, clinicId: req.user.clinicId },
    });
    if (!patient) return res.status(404).json({ success: false, message: 'Bemor topilmadi' });
    await patient.destroy();
    res.json({ success: true, message: 'Bemor o\'chirildi' });
  } catch (err) {
    next(err);
  }
};
