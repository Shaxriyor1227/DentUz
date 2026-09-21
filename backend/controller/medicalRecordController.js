'use strict';

const path = require('path');
const { MedicalRecord, Patient, Doctor, Appointment } = require('../models');
const { validateMedicalRecord } = require('../validations/medicalRecordValidation');
const { Op } = require('sequelize');
const multer = require('multer');

// ─── Multer (File Upload) Setup ───────────────────────────────────────────────
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
}).array('attachments', 10);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getPagination = (page = 1, limit = 20) => ({
  limit: Math.min(parseInt(limit) || 20, 100),
  offset: (Math.max(parseInt(page) || 1, 1) - 1) * Math.min(parseInt(limit) || 20, 100),
});

// ─── CREATE ───────────────────────────────────────────────────────────────────
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

// ─── GET ALL ──────────────────────────────────────────────────────────────────
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

    res.status(200).json({
      success: true,
      total: count,
      page: Math.max(parseInt(page) || 1, 1),
      limit: lim,
      data: rows,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET BY ID ────────────────────────────────────────────────────────────────
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

// ─── UPDATE ───────────────────────────────────────────────────────────────────
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

// ─── DELETE ───────────────────────────────────────────────────────────────────
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
