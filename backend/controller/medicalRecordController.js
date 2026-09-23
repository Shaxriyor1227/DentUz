
const path = require('path');
const { MedicalRecord, Patient, Doctor, Appointment } = require('../models');
const { validateMedicalRecord } = require('../validations/medicalRecordValidation');
const { Op } = require('sequelize');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/medical'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `MR-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|pdf|dcm/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  cb(null, allowed.test(ext));
};

exports.upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).array('attachments', 10);

const { getPagination, getPagingData } = require('../utils/pagination');

exports.createMedicalRecord = async (req, res) => {
  const { error } = validateMedicalRecord(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    let attachments = req.body.attachments || [];
    if (req.files && req.files.length > 0) {
      const uploaded = req.files.map((f) => ({
        name: f.originalname,
        url:  `/uploads/medical/${f.filename}`,
        type: f.mimetype,
      }));
      attachments = [...attachments, ...uploaded];
    }

    const record = await MedicalRecord.create({ ...req.body, attachments });
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMedicalRecords = async (req, res) => {
  try {
    const { patientId, doctorId, search, page, limit } = req.query;
    const where = {};
    const { limit: lim, offset } = getPagination(page, limit);

    if (patientId) where.patientId = patientId;
    if (doctorId)  where.doctorId  = doctorId;

    if (search && search.trim()) {
      const q = search.trim();
      where[Op.or] = [
        { complaints:      { [Op.iLike]: `%${q}%` } },
        { diagnosis:       { [Op.iLike]: `%${q}%` } },
        { treatmentDone:   { [Op.iLike]: `%${q}%` } },
        { toothNumber:     { [Op.iLike]: `%${q}%` } },
        { recommendations: { [Op.iLike]: `%${q}%` } },
      ];
    }

    const { count, rows } = await MedicalRecord.findAndCountAll({
      where,
      include: [
        { model: Patient, as: 'patient', attributes: ['id', 'name', 'phone'] },
        { model: Doctor,  as: 'doctor',  attributes: ['id', 'specialization'] },
      ],
      order: [['visitDate', 'DESC']],
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

exports.getMedicalRecordById = async (req, res) => {
  try {
    const record = await MedicalRecord.findByPk(req.params.id, {
      include: [
        { model: Patient,     as: 'patient'     },
        { model: Doctor,      as: 'doctor'      },
        { model: Appointment, as: 'appointment' },
      ],
    });
    if (!record) return res.status(404).json({ success: false, message: 'Tibbiy yozuv topilmadi' });
    res.status(200).json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateMedicalRecord = async (req, res) => {
  const { error } = validateMedicalRecord(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const record = await MedicalRecord.findByPk(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Tibbiy yozuv topilmadi' });

    let attachments = req.body.attachments || record.attachments || [];
    if (req.files && req.files.length > 0) {
      const uploaded = req.files.map((f) => ({
        name: f.originalname,
        url:  `/uploads/medical/${f.filename}`,
        type: f.mimetype,
      }));
      attachments = [...attachments, ...uploaded];
    }

    await record.update({ ...req.body, attachments });
    res.status(200).json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.searchMedicalRecord = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ success: false, message: 'Qidiruv so\'zi kiritilmadi' });

    const records = await MedicalRecord.findAll({
      where: {
        [Op.or]: [
          { complaints:      { [Op.iLike]: `%${query}%` } },
          { diagnosis:       { [Op.iLike]: `%${query}%` } },
          { treatmentDone:   { [Op.iLike]: `%${query}%` } },
          { toothNumber:     { [Op.iLike]: `%${query}%` } },
          { recommendations: { [Op.iLike]: `%${query}%` } },
        ],
      },
      include: [
        { model: Patient, as: 'patient' },
        { model: Doctor,  as: 'doctor'  },
      ],
      limit: 50,
    });

    res.status(200).json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findByPk(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Tibbiy yozuv topilmadi' });

    await record.destroy();
    res.status(200).json({ success: true, message: 'Tibbiy yozuv o\'chirildi' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
