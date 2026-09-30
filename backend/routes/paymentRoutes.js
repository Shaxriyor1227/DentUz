const express = require('express');
const router = express.Router();
const paymentController = require('../controller/paymentController');
const { validate } = require('../middleware/validate');
const { validatePayment } = require('../validations/paymentValidation');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment transactions and financial collection
 */

/**
 * @swagger
 * /api/payments:
 *   post:
 *     tags: [Payments]
 *     summary: Record a new payment transaction
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - amount
 *               - method
 *             properties:
 *               invoiceId:
 *                 type: string
 *                 example: INV-1001
 *               patientId:
 *                 type: string
 *                 example: P-1001
 *               amount:
 *                 type: integer
 *                 example: 250000
 *               method:
 *                 type: string
 *                 enum: [Naqd, Payme, Click, Uzcard, Humo, Bank]
 *                 example: Payme
 *               notes:
 *                 type: string
 *                 example: "Davolash uchun to'liq to'lov"
 *     responses:
 *       201:
 *         description: Payment recorded and invoice status updated
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/payments', authorize('owner', 'accountant'), validate(validatePayment), paymentController.createPayment);

/**
 * @swagger
 * /api/payments:
 *   get:
 *     tags: [Payments]
 *     summary: Get list of payments (supports search, filters, pagination)
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by receipt number or notes
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *         description: Patient ID
 *       - in: query
 *         name: invoiceId
 *         schema:
 *           type: string
 *         description: Invoice ID
 *       - in: query
 *         name: method
 *         schema:
 *           type: string
 *         description: Payment method (Naqd, Payme, Uzum, etc.)
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
 *         description: List of payments
 *       500:
 *         description: Server error
 */
router.get('/payments', authorize('owner', 'accountant', 'administrator'), paymentController.getPayments);

/**
 * @swagger
 * /api/payments/stats:
 *   get:
 *     tags: [Payments]
 *     summary: Get aggregated payment revenue stats
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [this_month, last_month, last_30_days]
 *           default: this_month
 *         description: Aggregation period
 *     responses:
 *       200:
 *         description: Payment statistics
 *       500:
 *         description: Server error
 */
router.get('/payments/stats', authorize('owner', 'accountant', 'administrator'), paymentController.getPaymentStats);

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     tags: [Payments]
 *     summary: Get payment details by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payment UUID
 *     responses:
 *       200:
 *         description: Payment details
 *       400:
 *         description: Invalid payment ID
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
router.get('/payments/:id', authorize('owner', 'accountant', 'administrator'), paymentController.getPaymentById);

/**
 * @swagger
 * /api/payments/{id}:
 *   put:
 *     tags: [Payments]
 *     summary: Update payment by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: integer
 *               method:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment updated
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Server error
 */
router.put('/payments/:id', authorize('owner', 'accountant'), validate(validatePayment), paymentController.updatePayment);

/**
 * @swagger
 * /api/payments/{id}:
 *   delete:
 *     tags: [Payments]
 *     summary: Delete payment record
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payment UUID
 *     responses:
 *       200:
 *         description: Payment deleted
 *       400:
 *         description: Invalid payment ID
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
router.delete('/payments/:id', authorize('owner', 'accountant'), paymentController.deletePayment);

module.exports = router;
