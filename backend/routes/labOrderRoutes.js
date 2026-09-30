const express = require('express');
const router = express.Router();
const labOrderController = require('../controller/labOrderController');
const { validate } = require('../middleware/validate');
const { validateLabOrder } = require('../validations/labOrderValidation');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: LabOrders
 *   description: Dental laboratory order tracking and technician collaboration
 */

/**
 * @swagger
 * /api/lab-orders:
 *   post:
 *     tags: [LabOrders]
 *     summary: Create a new laboratory order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - doctorId
 *               - technicianName
 *               - workType
 *               - dueDate
 *             properties:
 *               orderNumber:
 *                 type: string
 *                 example: LAB-2026-001
 *               patientId:
 *                 type: string
 *                 example: P-1001
 *               doctorId:
 *                 type: string
 *                 format: uuid
 *                 example: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
 *               technicianName:
 *                 type: string
 *                 example: "Master Dental Lab (Rustam)"
 *               technicianPhone:
 *                 type: string
 *                 example: "+998 90 987 65 43"
 *               workType:
 *                 type: string
 *                 enum: [crown, bridge, prosthesis, implant_abutment, aligner, veneer, inlay_onlay, other]
 *                 example: crown
 *               toothNumber:
 *                 type: string
 *                 example: "24, 25"
 *               shade:
 *                 type: string
 *                 example: "A2 VITA"
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-04-01"
 *               cost:
 *                 type: integer
 *                 example: 600000
 *               status:
 *                 type: string
 *                 enum: [sent, in_progress, received, fitted, completed, revision, cancelled]
 *                 example: sent
 *               notes:
 *                 type: string
 *                 example: "Sirka korona, tabiiy shaklda"
 *     responses:
 *       201:
 *         description: Lab order created
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/lab-orders', authorize('owner', 'doctor'), validate(validateLabOrder), labOrderController.createLabOrder);

/**
 * @swagger
 * /api/lab-orders/search:
 *   get:
 *     tags: [LabOrders]
 *     summary: Search lab orders by number, technician, or notes
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Matching lab orders
 *       400:
 *         description: Search query is required
 *       500:
 *         description: Server error
 */
router.get('/lab-orders/search', authorize('owner', 'doctor', 'administrator'), labOrderController.searchLabOrder);

/**
 * @swagger
 * /api/lab-orders:
 *   get:
 *     tags: [LabOrders]
 *     summary: Get list of lab orders (supports search, filters, pagination)
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by order number, technician, tooth number, or notes
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [sent, in_progress, received, fitted, cancelled]
 *         description: Filter by status
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *         description: Filter by patient ID
 *       - in: query
 *         name: doctorId
 *         schema:
 *           type: string
 *         description: Filter by doctor UUID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Paginated list of lab orders
 *       500:
 *         description: Server error
 */
router.get('/lab-orders', authorize('owner', 'doctor', 'administrator'), labOrderController.getLabOrders);

/**
 * @swagger
 * /api/lab-orders/{id}:
 *   get:
 *     tags: [LabOrders]
 *     summary: Get lab order by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lab order UUID
 *     responses:
 *       200:
 *         description: Lab order details
 *       400:
 *         description: Invalid lab order ID
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
router.get('/lab-orders/:id', authorize('owner', 'doctor', 'administrator'), labOrderController.getLabOrderById);

/**
 * @swagger
 * /api/lab-orders/{id}:
 *   put:
 *     tags: [LabOrders]
 *     summary: Update lab order by ID (e.g. update status when received or fitted)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lab order UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [sent, in_progress, received, fitted, completed, revision, cancelled]
 *               receivedDate:
 *                 type: string
 *                 format: date
 *               cost:
 *                 type: integer
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lab order updated
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
router.put('/lab-orders/:id', authorize('owner', 'doctor'), validate(validateLabOrder), labOrderController.updateLabOrder);

/**
 * @swagger
 * /api/lab-orders/{id}:
 *   delete:
 *     tags: [LabOrders]
 *     summary: Delete lab order by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lab order UUID
 *     responses:
 *       200:
 *         description: Lab order deleted
 *       400:
 *         description: Invalid lab order ID
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
router.delete('/lab-orders/:id', authorize('owner', 'doctor'), labOrderController.deleteLabOrder);

module.exports = router;
