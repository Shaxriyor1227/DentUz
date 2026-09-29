const { Odontogram, OdontogramHistory, Patient, User } = require('../models');
const { validateOdontogramUpdate } = require('../validations/odontogramValidation');
const { Op } = require('sequelize');
const { withTenantScope } = require('../utils/tenantScope');

exports.getOdontogramByPatient = async (req, res) => {
  try {
    const rawId = req.params.patientId;
    const possibleIds = [rawId, rawId.startsWith('P-') ? rawId.slice(2) : `P-${rawId}`];

    // Verify patient belongs to current tenant
    const patient = await Patient.findOne({
      where: withTenantScope(req, { id: { [Op.in]: possibleIds } }),
    });

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Bemor topilmadi yoki ushbu klinikaga tegishli emas' });
    }

    let odontogram = await Odontogram.findOne({
      where: { patientId: patient.id },
      include: [
        { model: OdontogramHistory, as: 'history', limit: 20, order: [['createdAt', 'DESC']] },
        { model: Patient,           as: 'patient' },
      ],
    });

    if (!odontogram) {
      odontogram = await Odontogram.create({
        patientId: patient.id,
        teeth: {},
        lastUpdatedBy: req.user?.id || null,
      });
    }

    res.status(200).json({ success: true, data: odontogram });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.saveOdontogram = async (req, res) => {
  const { error } = validateOdontogramUpdate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const rawId = req.params.patientId;
    const possibleIds = [rawId, rawId.startsWith('P-') ? rawId.slice(2) : `P-${rawId}`];

    // Verify patient belongs to current tenant
    const patient = await Patient.findOne({
      where: withTenantScope(req, { id: { [Op.in]: possibleIds } }),
    });

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Bemor topilmadi yoki ushbu klinikaga tegishli emas' });
    }

    const { teeth, changedTooth, previousCondition, newCondition, notes } = req.body;
    const userId = req.user?.id || null;

    let odontogram = await Odontogram.findOne({
      where: { patientId: patient.id },
    });

    if (!odontogram) {
      odontogram = await Odontogram.create({
        patientId: patient.id,
        teeth,
        lastUpdatedBy: userId,
      });
    } else {
      await odontogram.update({ teeth, lastUpdatedBy: userId });
    }

    await OdontogramHistory.create({
      odontogramId:      odontogram.id,
      patientId:         patient.id,
      snapshot:          teeth,
      changedTooth,
      previousCondition,
      newCondition,
      notes,
      savedBy:           userId,
    });

    res.status(200).json({ success: true, data: odontogram });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOdontogramHistory = async (req, res) => {
  try {
    const rawId = req.params.patientId;
    const possibleIds = [rawId, rawId.startsWith('P-') ? rawId.slice(2) : `P-${rawId}`];

    // Verify patient belongs to current tenant
    const patient = await Patient.findOne({
      where: withTenantScope(req, { id: { [Op.in]: possibleIds } }),
    });

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Bemor topilmadi yoki ushbu klinikaga tegishli emas' });
    }

    const history = await OdontogramHistory.findAll({
      where: { patientId: patient.id },
      include: [{ model: User, as: 'author' }],
      order: [['createdAt', 'DESC']],
      limit: 50,
    });
    res.status(200).json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
