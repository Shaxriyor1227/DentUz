
const { Clinic, User, Doctor, Patient, Appointment, Invoice } = require('../models');
const { validateClinic } = require('../validations/clinicValidation');

exports.getClinics = async (req, res) => {
  try {
    const clinics = await Clinic.findAll();
    res.status(200).json({ success: true, data: clinics });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getClinicById = async (req, res) => {
  try {
    const clinic = await Clinic.findByPk(req.params.id, {
      include: [
        { model: User, as: 'users', attributes: ['id', 'name', 'role', 'email'] },
        { model: Doctor, as: 'doctors', attributes: ['id', 'userId', 'specialization', 'cabinetNumber'] },
      ],
    });
    if (!clinic) return res.status(404).json({ success: false, message: 'Klinika topilmadi' });
    res.status(200).json({ success: true, data: clinic });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createClinic = async (req, res) => {
  const { error } = validateClinic(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const clinic = await Clinic.create(req.body);
    res.status(201).json({ success: true, data: clinic });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateClinic = async (req, res) => {
  const { error } = validateClinic(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const clinic = await Clinic.findByPk(req.params.id);
    if (!clinic) return res.status(404).json({ success: false, message: 'Klinika topilmadi' });

    await clinic.update(req.body);
    res.status(200).json({ success: true, data: clinic });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteClinic = async (req, res) => {
  try {
    const clinic = await Clinic.findByPk(req.params.id);
    if (!clinic) return res.status(404).json({ success: false, message: 'Klinika topilmadi' });

    const data = clinic.toJSON();
    await clinic.destroy();
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getClinicStats = async (req, res) => {
  try {
    const { id: clinicId } = req.params;

    const [usersCount, patientsCount, appointmentsCount, invoicesCount] = await Promise.all([
      User.count({ where: { clinicId } }),
      Patient.count({ where: { clinicId } }),
      Appointment.count({ where: { clinicId } }),
      Invoice.count({ where: { clinicId } }),
    ]);

    res.status(200).json({
      success: true,
      data: { clinicId, usersCount, patientsCount, appointmentsCount, invoicesCount },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
