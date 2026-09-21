'use strict';

const { Odontogram, OdontogramHistory } = require('../models');

/** GET /api/odontogram/:patientId */
exports.getByPatient = async (req, res, next) => {
  try {
    let odontogram = await Odontogram.findOne({
      where: { patientId: req.params.patientId },
      include: [{ model: OdontogramHistory, as: 'history', order: [['createdAt', 'DESC']], limit: 20 }],
    });

    // Auto-create empty odontogram if none exists
    if (!odontogram) {
      odontogram = await Odontogram.create({ patientId: req.params.patientId, teeth: {} });
    }

    res.json({ success: true, odontogram });
  } catch (err) {
    next(err);
  }
};

/** PUT /api/odontogram/:patientId — save full teeth map */
exports.save = async (req, res, next) => {
  try {
    const { teeth, changedTooth, previousCondition, newCondition, notes } = req.body;

    let odontogram = await Odontogram.findOne({ where: { patientId: req.params.patientId } });
    if (!odontogram) {
      odontogram = await Odontogram.create({
        patientId: req.params.patientId,
        teeth,
        lastUpdatedBy: req.user.id,
      });
    } else {
      await odontogram.update({ teeth, lastUpdatedBy: req.user.id });
    }

    // Append history record
    await OdontogramHistory.create({
      odontogramId: odontogram.id,
      patientId: req.params.patientId,
      snapshot: teeth,
      changedTooth,
      previousCondition,
      newCondition,
      notes,
      savedBy: req.user.id,
    });

    res.json({ success: true, odontogram });
  } catch (err) {
    next(err);
  }
};

/** GET /api/odontogram/:patientId/history */
exports.getHistory = async (req, res, next) => {
  try {
    const history = await OdontogramHistory.findAll({
      where: { patientId: req.params.patientId },
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, history });
  } catch (err) {
    next(err);
  }
};
