const express = require("express");
const router = express.Router();
const odontogramController = require("../controller/odontogramController");
const { validate } = require("../middleware/validate");
const { validateOdontogramUpdate } = require("../validations/odontogramValidation");

/**
 * @swagger
 * tags:
 *   name: Odontogram
 *   description: Interactive dental chart & tooth history
 */

/**
 * @swagger
 * /api/odontogram/{patientId}:
 *   get:
 *     tags: [Odontogram]
 *     summary: Get odontogram teeth data by patient ID
 *     parameters:
 *       - in: path
 *         name: patientId
 *         schema:
 *           type: string
 *         required: true
 *         description: Patient ID (e.g. P-1001)
 *     responses:
 *       200:
 *         description: Current teeth condition map and recent history
 *       500:
 *         description: Server error
 */
router.get("/odontogram/:patientId", odontogramController.getOdontogramByPatient);

/**
 * @swagger
 * /api/odontogram/{patientId}:
 *   put:
 *     tags: [Odontogram]
 *     summary: Save or update teeth map for a patient
 *     parameters:
 *       - in: path
 *         name: patientId
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
 *               teeth:
 *                 type: object
 *                 example: { "16": { "condition": "caries", "notes": "Chuqur karies" } }
 *               changedTooth:
 *                 type: integer
 *                 example: 16
 *               previousCondition:
 *                 type: string
 *                 example: healthy
 *               newCondition:
 *                 type: string
 *                 example: caries
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated odontogram
 *       500:
 *         description: Server error
 */
router.put("/odontogram/:patientId", validate(validateOdontogramUpdate), odontogramController.saveOdontogram);

/**
 * @swagger
 * /api/odontogram/{patientId}/history:
 *   get:
 *     tags: [Odontogram]
 *     summary: Get tooth change history log for a patient
 *     parameters:
 *       - in: path
 *         name: patientId
 *         schema:
 *           type: string
 *         required: true
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: List of historical odontogram updates
 *       500:
 *         description: Server error
 */
router.get("/odontogram/:patientId/history", odontogramController.getOdontogramHistory);

module.exports = router;
