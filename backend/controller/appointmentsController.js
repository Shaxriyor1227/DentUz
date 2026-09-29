const { Appointment, Patient, Doctor, Clinic } = require('../models');
const { validateAppointment } = require('../validations/appointmentValidation');
const { Op } = require('sequelize');
const { getPagination, getPagingData } = require('../utils/pagination');
const { withTenantScope } = require('../utils/tenantScope');
const { notifyAppointmentCreated, notifyAppointmentUpdated } = require('../services/notificationService');

exports.createAppointment = async (req, res) => {
  const { error } = validateAppointment(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const payload = { ...req.body };
    if (!payload.id) {
      payload.id = `apt-${Date.now()}`;
    }

    // Always enforce tenant clinicId
    payload.clinicId = req.clinicId;

    // Check doctor belongs to this clinic
    let foundDoctor = null;
    if (payload.doctorId) {
      foundDoctor = await Doctor.findOne({
        where: withTenantScope(req, { id: payload.doctorId }),
      });
      if (!foundDoctor) {
        return res.status(404).json({ success: false, message: 'Shifokor topilmadi yoki ushbu klinikaga tegishli emas' });
      }
    }

    // Resolve or create Patient scoped to this clinic
    let patientId = payload.patientId;
    let foundPatient = null;
    if (patientId) {
      const possibleIds = [patientId, patientId.startsWith('P-') ? patientId.slice(2) : `P-${patientId}`];
      foundPatient = await Patient.findOne({
        where: withTenantScope(req, { id: { [Op.in]: possibleIds } }),
      });
      if (!foundPatient) {
        return res.status(404).json({ success: false, message: 'Bemor topilmadi yoki ushbu klinikaga tegishli emas' });
      }
      patientId = foundPatient.id;
    } else if (payload.patientName) {
      foundPatient = await Patient.findOne({
        where: withTenantScope(req, { name: payload.patientName.trim() }),
      });
      if (!foundPatient) {
        const count = await Patient.count({ where: withTenantScope(req) });
        foundPatient = await Patient.create({
          id: `P-${1042 + count + 1}`,
          name: payload.patientName.trim(),
          phone: payload.patientPhone || '+998 90 000 00 00',
          status: 'today',
          clinicId: req.clinicId,
        });
      }
      patientId = foundPatient.id;
    } else {
      foundPatient = await Patient.findOne({ where: withTenantScope(req) });
      if (!foundPatient) {
        foundPatient = await Patient.create({
          id: `P-${Date.now()}`,
          name: 'Noma\'lum Bemor',
          phone: '+998 90 000 00 00',
          clinicId: req.clinicId,
        });
      }
      patientId = foundPatient.id;
    }

    payload.patientId = patientId;

    const appointment = await Appointment.create(payload);

    // Asynchronously trigger notification
    notifyAppointmentCreated(appointment, foundPatient, foundDoctor, req.clinicId).catch(() => {});

    res.status(201).json({ success: true, data: appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const { status, doctorId, patientId, date, page, limit } = req.query;
    let where = {};
    const { limit: lim, offset } = getPagination(page, limit);

    if (status)    where.status    = status;
    if (doctorId)  where.doctorId  = doctorId;
    if (patientId) where.patientId = patientId;
    if (date)      where.date      = date;

    where = withTenantScope(req, where);

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
    const where = withTenantScope(req, { date: today });

    const appointments = await Appointment.findAll({
      where,
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
    const appointment = await Appointment.findOne({
      where: withTenantScope(req, { id: req.params.id }),
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
    const appointment = await Appointment.findOne({
      where: withTenantScope(req, { id: req.params.id }),
    });
    if (!appointment) return res.status(404).json({ success: false, message: 'Qabulxona topilmadi' });

    const prevDate = appointment.date;
    const prevTime = appointment.time;
    const prevStatus = appointment.status;

    delete req.body.clinicId;
    await appointment.update(req.body);

    // If date, time, or status changed, notify clinic
    const isRescheduled = (req.body.date && req.body.date !== prevDate) || (req.body.time && req.body.time !== prevTime);
    const isStatusChanged = req.body.status && req.body.status !== prevStatus;

    if (isRescheduled || isStatusChanged) {
      let statusDesc = '';
      if (isRescheduled) {
        statusDesc = `qabul vaqti ${appointment.date} soat ${appointment.time || ''} ga ko'chirildi`;
      } else if (req.body.status === 'cancelled') {
        statusDesc = 'qabuli bekor qilindi';
      } else if (req.body.status === 'completed') {
        statusDesc = 'muolajasi yakunlandi';
      } else {
        statusDesc = `holati "${req.body.status}" ga o'zgartirildi`;
      }

      const patient = await Patient.findOne({ where: withTenantScope(req, { id: appointment.patientId }) });
      notifyAppointmentUpdated(appointment, patient, statusDesc, req.clinicId).catch(() => {});
    }

    res.status(200).json({ success: true, data: appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      where: withTenantScope(req, { id: req.params.id }),
    });
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

    let where = {
      [Op.or]: [
        { patientName: { [Op.iLike]: `%${query}%` } },
        { procedure:   { [Op.iLike]: `%${query}%` } },
        { doctorName:  { [Op.iLike]: `%${query}%` } },
      ],
    };
    where = withTenantScope(req, where);

    const appointments = await Appointment.findAll({
      where,
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
