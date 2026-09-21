const express = require('express');
const router = express.Router();
const treatmentPlanController = require('../controller/treatmentPlanController');

/**
 * @swagger
 * tags:
 *   name: TreatmentPlans
 *   description: Comprehensive dental treatment plans
 */

/**
 * @swagger
 * /api/treatment-plans:
 *   post:
 *     tags: [TreatmentPlans]
 *     summary: Create a new treatment plan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - doctorId
 *             properties:
 *               id:
 *                 type: string
 *                 example: TP-101
 *               title:
 *                 type: string
 *                 example: "Implantatsiya va restavratsiya rejasi"
 *               patientId:
 *                 type: string
 *                 example: P-1001
 *               doctorId:
 *                 type: string
 *                 format: uuid
 *                 example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
 *               diagnosis:
 *                 type: string
 *                 example: "Qisman ikkilamchi adentiya"
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     tooth:
 *                       type: integer
 *                       example: 16
 *                     serviceName:
 *                       type: string
 *                       example: "Implant o'rnatish"
 *                     cost:
 *                       type: integer
 *                       example: 3500000
 *                     status:
 *                       type: string
 *                       enum: [planned, in_progress, completed, skipped]
 *                       example: planned
 *               totalEstimatedCost:
 *                 type: integer
 *                 example: 3500000
 *               discountPercent:
 *                 type: integer
 *                 example: 5
 *               finalCost:
 *                 type: integer
 *                 example: 3325000
 *               status:
 *                 type: string
 *                 enum: [draft, active, completed, cancelled]
 *                 example: active
 *               notes:
 *                 type: string
 *                 example: "3 bosqichda amalga oshiriladi"
 *     responses:
 *       201:
 *         description: Treatment plan created
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/treatment-plans', treatmentPlanController.createTreatmentPlan);

/**
 * @swagger
 * /api/treatment-plans:
 *   get:
 *     tags: [TreatmentPlans]
 *     summary: Get treatment plans (filter by patient, doctor, status)
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter status (draft, active, completed, cancelled)
 *     responses:
 *       200:
 *         description: List of treatment plans
 *       500:
 *         description: Server error
 */
router.get('/treatment-plans', treatmentPlanController.getTreatmentPlans);

/**
 * @swagger
 * /api/treatment-plans/{id}:
 *   get:
 *     tags: [TreatmentPlans]
 *     summary: Get treatment plan by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Treatment Plan ID
 *     responses:
 *       200:
 *         description: Treatment plan details
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
router.get('/treatment-plans/:id', treatmentPlanController.getTreatmentPlanById);

/**
 * @swagger
 * /api/treatment-plans/{id}:
 *   put:
 *     tags: [TreatmentPlans]
 *     summary: Update treatment plan by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Treatment Plan ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               diagnosis:
 *                 type: string
 *               items:
 *                 type: array
 *               totalEstimatedCost:
 *                 type: integer
 *               discountPercent:
 *                 type: integer
 *               finalCost:
 *                 type: integer
 *               status:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Treatment plan updated
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
router.put('/treatment-plans/:id', treatmentPlanController.updateTreatmentPlan);

/**
 * @swagger
 * /api/treatment-plans/{id}:
 *   delete:
 *     tags: [TreatmentPlans]
 *     summary: Delete treatment plan by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Treatment Plan ID
 *     responses:
 *       200:
 *         description: Treatment plan deleted
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
router.delete('/treatment-plans/:id', treatmentPlanController.deleteTreatmentPlan);

module.exports = router;
