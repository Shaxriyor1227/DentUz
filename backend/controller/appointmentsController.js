'use strict';

const { Appointment } = require('../models');

/** GET /api/appointments — all clinic appointments */
exports.getAll = async (req, res, next) => {
  try {
    const appointments = await Appointment.findAll({
      where: { clinicId: req.user.clinicId },
      order: [['date', 'ASC'], ['time', 'ASC']],
    });
    res.json({ success: true, appointments });
  } catch (err) { next(err); }
};

/** GET /api/appointments/today */
exports.getToday = async (req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const appointments = await Appointment.findAll({
      where: { clinicId: req.user.clinicId, date: today },
      order: [['time', 'ASC']],
    });
    res.json({ success: true, appointments });
  } catch (err) { next(err); }
};

/** POST /api/appointments */
exports.create = async (req, res, next) => {
  try {
    const apt = await Appointment.create({ ...req.body, clinicId: req.user.clinicId });
    res.status(201).json({ success: true, appointment: apt });
  } catch (err) { next(err); }
};

/** PUT /api/appointments/:id */
exports.update = async (req, res, next) => {
  try {
    const apt = await Appointment.findOne({ where: { id: req.params.id, clinicId: req.user.clinicId } });
    if (!apt) return res.status(404).json({ success: false, message: 'Qabulxona yozuvi topilmadi' });
    await apt.update(req.body);
    res.json({ success: true, appointment: apt });
  } catch (err) { next(err); }
};

/** DELETE /api/appointments/:id */
exports.remove = async (req, res, next) => {
  try {
    const apt = await Appointment.findOne({ where: { id: req.params.id, clinicId: req.user.clinicId } });
    if (!apt) return res.status(404).json({ success: false, message: 'Qabulxona yozuvi topilmadi' });
    await apt.destroy();
    res.json({ success: true, message: 'Qabul o\'chirildi' });
  } catch (err) { next(err); }
};
