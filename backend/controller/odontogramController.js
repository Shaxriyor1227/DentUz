'use strict';

const { Odontogram, OdontogramHistory, Patient, User } = require('../models');
const { validateOdontogramUpdate } = require('../validations/odontogramValidation');

exports.getOdontogramByPatient = async (req, res) => {
  try {
    let odontogram = await Odontogram.findOne({
      where: { patientId: req.params.patientId },
      include: [
        { model: OdontogramHistory, as: 'history', limit: 20, order: [['createdAt', 'DESC']] },
        { model: Patient,           as: 'patient' },
      ],
    });

    if (!odontogram) {
      odontogram = await Odontogram.create({
        patientId: req.params.patientId,
        teeth: {},
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
    const { teeth, changedTooth, previousCondition, newCondition, notes } = req.body;
    const userId = req.user?.id || null;

    let odontogram = await Odontogram.findOne({
      where: { patientId: req.params.patientId },
    });

    if (!odontogram) {
      odontogram = await Odontogram.create({
        patientId: req.params.patientId,
        teeth,
        lastUpdatedBy: userId,
      });
    } else {
      await odontogram.update({ teeth, lastUpdatedBy: userId });
    }

    await OdontogramHistory.create({
      odontogramId:      odontogram.id,
      patientId:         req.params.patientId,
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
    const history = await OdontogramHistory.findAll({
      where: { patientId: req.params.patientId },
      include: [{ model: User, as: 'author' }],
      order: [['createdAt', 'DESC']],
      limit: 50,
    });
    res.status(200).json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
