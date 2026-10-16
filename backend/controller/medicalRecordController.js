const path = require('path');
const { MedicalRecord, Patient, Doctor, Appointment } = require('../models');
const { validateMedicalRecord } = require('../validations/medicalRecordValidation');
const { Op } = require('sequelize');
const multer = require('multer');
const { getPagination, getPagingData } = require('../utils/pagination');
const { withTenantScope } = require('../utils/tenantScope');
const storageService = require('../services/storageService');

// Use memoryStorage so we can perform magic bytes validation on raw buffer
const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file limit
}).array('attachments', 10);

exports.upload = uploadMiddleware;

exports.createMedicalRecord = async (req, res) => {
  const { error } = validateMedicalRecord(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const { patientId, doctorId } = req.body;
    if (patientId) {
      const patient = await Patient.findOne({
        where: withTenantScope(req, { id: patientId }),
      });
      if (!patient) {
        return res.status(404).json({ success: false, message: 'Bemor topilmadi yoki ushbu klinikaga tegishli emas' });
      }
    }

    if (doctorId) {
      const doctor = await Doctor.findOne({
        where: withTenantScope(req, { id: doctorId }),
      });
      if (!doctor) {
        return res.status(404).json({ success: false, message: 'Shifokor topilmadi yoki ushbu klinikaga tegishli emas' });
      }
    }

    let attachments = req.body.attachments || [];
    if (typeof attachments === 'string') {
      try { attachments = JSON.parse(attachments); } catch {}
    }
    if (!Array.isArray(attachments)) attachments = [];

    // Process uploaded files with magic-bytes validation & secure storage
    if (req.files && req.files.length > 0) {
      for (const f of req.files) {
        const saved = await storageService.saveFile({
          buffer: f.buffer,
          originalName: f.originalname,
          mimeType: f.mimetype,
        });
        attachments.push({
          id: saved.id,
          name: saved.originalName,
          storedFilename: saved.storedFilename,
          type: saved.mimeType,
          size: saved.size,
          url: `/api/medical-records/files/${saved.storedFilename}`,
        });
      }
    }

    const record = await MedicalRecord.create({
      ...req.body,
      attachments,
      clinicId: req.clinicId,
    });
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMedicalRecords = async (req, res) => {
  try {
    const { patientId, doctorId, search, page, limit } = req.query;
    let where = {};
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

    where = withTenantScope(req, where);

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
    const record = await MedicalRecord.findOne({
      where: withTenantScope(req, { id: req.params.id }),
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
    const record = await MedicalRecord.findOne({
      where: withTenantScope(req, { id: req.params.id }),
    });
    if (!record) return res.status(404).json({ success: false, message: 'Tibbiy yozuv topilmadi' });

    // Doctor ownership check: A doctor can only modify records created by them
    if (req.user && req.user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({
        where: withTenantScope(req, { userId: req.user.id })
      });
      if (doctorProfile && record.doctorId !== doctorProfile.id) {
        return res.status(403).json({
          success: false,
          message: "Ruxsat yo'q: Boshqa shifokorga tegishli tibbiy yozuvni tahrirlash taqiqlanadi"
        });
      }
    }

    let attachments = req.body.attachments || record.attachments || [];
    if (typeof attachments === 'string') {
      try { attachments = JSON.parse(attachments); } catch {}
    }
    if (!Array.isArray(attachments)) attachments = [];

    if (req.files && req.files.length > 0) {
      for (const f of req.files) {
        const saved = await storageService.saveFile({
          buffer: f.buffer,
          originalName: f.originalname,
          mimeType: f.mimetype,
        });
        attachments.push({
          id: saved.id,
          name: saved.originalName,
          storedFilename: saved.storedFilename,
          type: saved.mimeType,
          size: saved.size,
          url: `/api/medical-records/files/${saved.storedFilename}`,
        });
      }
    }

    delete req.body.clinicId;
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

    let where = {
      [Op.or]: [
        { complaints:      { [Op.iLike]: `%${query}%` } },
        { diagnosis:       { [Op.iLike]: `%${query}%` } },
        { treatmentDone:   { [Op.iLike]: `%${query}%` } },
        { toothNumber:     { [Op.iLike]: `%${query}%` } },
        { recommendations: { [Op.iLike]: `%${query}%` } },
      ],
    };
    where = withTenantScope(req, where);

    const records = await MedicalRecord.findAll({
      where,
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
    const record = await MedicalRecord.findOne({
      where: withTenantScope(req, { id: req.params.id }),
    });
    if (!record) return res.status(404).json({ success: false, message: 'Tibbiy yozuv topilmadi' });

    // Doctor ownership check on delete
    if (req.user && req.user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({
        where: withTenantScope(req, { userId: req.user.id })
      });
      if (doctorProfile && record.doctorId !== doctorProfile.id) {
        return res.status(403).json({
          success: false,
          message: "Ruxsat yo'q: Boshqa shifokorga tegishli tibbiy yozuvni o'chirish taqiqlanadi"
        });
      }
    }

    await record.destroy();
    res.status(200).json({ success: true, message: 'Tibbiy yozuv o\'chirildi' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Secure file retrieval endpoint:
 * GET /api/medical-records/:id/files/:fileId
 * - Authenticated & Tenant Scoped
 * - Cache-Control: private, no-store
 * - Content-Disposition with safe sanitized filename
 */
exports.getAttachmentFile = async (req, res) => {
  try {
    const { id, fileId } = req.params;

    // Check if :id is a medical record ID or a direct file query
    const record = await MedicalRecord.findOne({
      where: withTenantScope(req, { id }),
    });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Tibbiy yozuv topilmadi yoki boshqa klinikaga tegishli' });
    }

    const attachments = record.attachments || [];
    const target = attachments.find(
      (a) => a.id === fileId || a.storedFilename === fileId || (a.url && a.url.includes(fileId))
    );

    const storedFilename = target?.storedFilename || fileId;
    const fileData = await storageService.getFile(storedFilename);

    if (!fileData) {
      return res.status(404).json({ success: false, message: 'Fayl topilmadi' });
    }

    const downloadName = target?.name || target?.originalName || storedFilename;
    const mimeType = target?.type || fileData.mimeType || 'application/octet-stream';

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(downloadName)}"`);
    res.setHeader('Cache-Control', 'private, no-store, max-age=0, must-revalidate');
    res.setHeader('Pragma', 'no-cache');

    return res.send(fileData.buffer);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
