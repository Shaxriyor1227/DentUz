const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controller/medicalRecordController');

/**
 * @swagger
 * tags:
 *   name: MedicalRecords
 *   description: Electronic Health Records (EHR) and file/X-ray attachments
 */

/**
 * @swagger
 * /api/medical-records:
 *   post:
 *     tags: [MedicalRecords]
 *     summary: Create a new medical record (supports multipart/form-data for attachments)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - doctorId
 *               - complaints
 *               - diagnosis
 *             properties:
 *               patientId:
 *                 type: string
 *                 example: P-1001
 *               doctorId:
 *                 type: string
 *                 format: uuid
 *                 example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
 *               appointmentId:
 *                 type: string
 *                 format: uuid
 *               visitDate:
 *                 type: string
 *                 format: date-time
 *               complaints:
 *                 type: string
 *                 example: "Pastki jag'da og'riq"
 *               diagnosis:
 *                 type: string
 *                 example: "O'tkir pulpit (K04.0)"
 *               treatmentDone:
 *                 type: string
 *                 example: "Kanal ochildi, dori qo'yildi"
 *               recommendations:
 *                 type: string
 *                 example: "3 kundan so'ng qayta ko'rik"
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Upload X-ray images, PDF reports, scans
 *     responses:
 *       201:
 *         description: Medical record created
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post(
  '/medical-records',
  medicalRecordController.upload,
  medicalRecordController.createMedicalRecord
);

/**
 * @swagger
 * /api/medical-records:
 *   get:
 *     tags: [MedicalRecords]
 *     summary: Get medical records list (filter by patient or doctor)
 *     parameters:
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *         description: Patient ID
 *       - in: query
 *         name: doctorId
 *         schema:
 *           type: string
 *         description: Doctor UUID
 *     responses:
 *       200:
 *         description: List of medical records
 *       500:
 *         description: Server error
 */
router.get('/medical-records', medicalRecordController.getMedicalRecords);

/**
 * @swagger
 * /api/medical-records/search:
 *   get:
 *     tags: [MedicalRecords]
 *     summary: Search medical records by complaints, diagnosis, treatment, or tooth number
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: List of matching medical records
 *       400:
 *         description: Search query is required
 *       500:
 *         description: Server error
 */
router.get('/medical-records/search', medicalRecordController.searchMedicalRecord);

/**
 * @swagger
 * /api/medical-records/{id}:
 *   get:
 *     tags: [MedicalRecords]
 *     summary: Get medical record by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Medical Record UUID
 *     responses:
 *       200:
 *         description: Medical record details
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
router.get('/medical-records/:id', medicalRecordController.getMedicalRecordById);

/**
 * @swagger
 * /api/medical-records/{id}:
 *   put:
 *     tags: [MedicalRecords]
 *     summary: Update medical record by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Medical Record UUID
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               complaints:
 *                 type: string
 *               diagnosis:
 *                 type: string
 *               treatmentDone:
 *                 type: string
 *               recommendations:
 *                 type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Medical record updated
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
router.put(
  '/medical-records/:id',
  medicalRecordController.upload,
  medicalRecordController.updateMedicalRecord
);

/**
 * @swagger
 * /api/medical-records/{id}:
 *   delete:
 *     tags: [MedicalRecords]
 *     summary: Delete medical record by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Medical Record UUID
 *     responses:
 *       200:
 *         description: Medical record deleted
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
router.delete('/medical-records/:id', medicalRecordController.deleteMedicalRecord);

module.exports = router;
