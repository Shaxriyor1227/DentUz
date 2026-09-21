const express = require("express");
const router = express.Router();
const patientController = require("../controller/patientsController");

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: Patient management
 */

/**
 * @swagger
 * /api/patients:
 *   post:
 *     tags: [Patients]
 *     summary: Create a new patient
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               id:
 *                 type: string
 *                 example: P-1050
 *               name:
 *                 type: string
 *                 example: Alisher Usmonov
 *               phone:
 *                 type: string
 *                 example: +998 90 123 45 67
 *               birthdate:
 *                 type: string
 *                 format: date
 *                 example: 1990-05-15
 *               age:
 *                 type: integer
 *                 example: 36
 *               status:
 *                 type: string
 *                 enum: [today, scheduled, debtor, all]
 *                 example: scheduled
 *               allergies:
 *                 type: string
 *                 example: Penitsillin
 *               notes:
 *                 type: string
 *                 example: Birinchi tashrif
 *     responses:
 *       201:
 *         description: Patient created
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post("/patients", patientController.createPatient);

/**
 * @swagger
 * /api/patients:
 *   get:
 *     tags: [Patients]
 *     summary: Get all patients
 *     responses:
 *       200:
 *         description: List of patients
 *       500:
 *         description: Server error
 */
router.get("/patients", patientController.getPatients);

/**
 * @swagger
 * /api/patients/search:
 *   get:
 *     tags: [Patients]
 *     summary: Search patients by name, phone, or ID
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query for patient name, phone, or ID
 *     responses:
 *       200:
 *         description: List of patients matching search
 *       400:
 *         description: Search query is required
 *       500:
 *         description: Server error
 */
router.get("/patients/search", patientController.searchPatient);

/**
 * @swagger
 * /api/patients/{id}:
 *   get:
 *     tags: [Patients]
 *     summary: Get patient by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Patient ID (e.g. P-1001)
 *     responses:
 *       200:
 *         description: Patient details
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.get("/patients/:id", patientController.getPatientById);

/**
 * @swagger
 * /api/patients/{id}:
 *   put:
 *     tags: [Patients]
 *     summary: Update patient by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Patient ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               status:
 *                 type: string
 *               allergies:
 *                 type: string
 *               notes:
 *                 type: string
 *               balance:
 *                 type: number
 *     responses:
 *       200:
 *         description: Patient updated
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.put("/patients/:id", patientController.updatePatient);

/**
 * @swagger
 * /api/patients/{id}:
 *   delete:
 *     tags: [Patients]
 *     summary: Delete patient by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Patient deleted
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Server error
 */
router.delete("/patients/:id", patientController.deletePatient);

module.exports = router;
