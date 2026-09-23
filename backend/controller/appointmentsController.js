
const { Appointment, Patient, Doctor, Clinic } = require('../models');
const { validateAppointment } = require('../validations/appointmentValidation');
const { Op } = require('sequelize');
const { getPagination, getPagingData } = require('../utils/pagination');

exports.createAppointment = async (req, res) => {
  const { error } = validateAppointment(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const appointment = await Appointment.create(req.body);
    res.status(201).json({ success: true, data: appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const { status, doctorId, patientId, date, page, limit } = req.query;
    const where = {};
    const { limit: lim, offset } = getPagination(page, limit);

    if (status)    where.status    = status;
    if (doctorId)  where.doctorId  = doctorId;
    if (patientId) where.patientId = patientId;
    if (date)      where.date      = date;

    const { count, rows } = await Appointment.findAndCountAll({
      where,
      include: [
        { model: Patient, as: 'patient' },
        { model: Doctor,  as: 'doctor'  },
      ],
      order: [['date', 'ASC'], ['time', 'ASC']],
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

exports.getTodayAppointments = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const appointments = await Appointment.findAll({
      where: { date: today },
      include: [
        { model: Patient, as: 'patient' },
        { model: Doctor,  as: 'doctor'  },
      ],
      order: [['time', 'ASC']],
    });
    res.status(200).json({ success: true, data: appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: Doctor,  as: 'doctor'  },
        { model: Clinic,  as: 'clinic'  },
      ],
    });
    if (!appointment) return res.status(404).json({ success: false, message: 'Qabulxona topilmadi' });
    res.status(200).json({ success: true, data: appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateAppointment = async (req, res) => {
  const { error } = validateAppointment(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Qabulxona topilmadi' });

    await appointment.update(req.body);
    res.status(200).json({ success: true, data: appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Qabulxona topilmadi' });

    const data = appointment.toJSON();
    await appointment.destroy();
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.searchAppointment = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ success: false, message: 'Qidiruv so\'zi kiritilmadi' });

    const appointments = await Appointment.findAll({
      where: {
        [Op.or]: [
          { patientName: { [Op.iLike]: `%${query}%` } },
          { procedure:   { [Op.iLike]: `%${query}%` } },
          { doctorName:  { [Op.iLike]: `%${query}%` } },
        ],
      },
      include: [
        { model: Patient, as: 'patient' },
        { model: Doctor,  as: 'doctor'  },
      ],
      limit: 50,
    });

    res.status(200).json({ success: true, data: appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
