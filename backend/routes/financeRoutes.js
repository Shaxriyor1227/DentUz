const express = require("express");
const router = express.Router();
const financeController = require("../controller/financeController");
const { validate } = require("../middleware/validate");
const { validateInvoice } = require("../validations/invoiceValidation");
const { authenticate, authorize } = require("../middleware/auth");

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Finance
 *   description: Financial records, billing & invoices
 */

/**
 * @swagger
 * /api/finance/stats:
 *   get:
 *     tags: [Finance]
 *     summary: Get clinic financial KPI stats
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [this_month, last_month, custom]
 *         description: Time period for calculation
 *     responses:
 *       200:
 *         description: Revenue, pending amounts, and summaries
 *       400:
 *         description: Invalid period filter
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/finance/stats", authorize('owner', 'accountant', 'administrator'), financeController.getStats);

/**
 * @swagger
 * /api/finance/invoices:
 *   get:
 *     tags: [Finance]
 *     summary: Get all invoices (supports search, filters, pagination)
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by patient name, doctor, or procedure
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [paid, pending, partially_paid, cancelled]
 *         description: Filter invoices by status
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *         description: Filter by patient ID (e.g. P-1001)
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
 *         description: Paginated list of invoices
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/finance/invoices", authorize('owner', 'accountant', 'administrator'), financeController.getInvoices);

/**
 * @swagger
 * /api/finance/invoices:
 *   post:
 *     tags: [Finance]
 *     summary: Create an invoice
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               id:
 *                 type: string
 *                 example: INV-2026-003
 *               patientId:
 *                 type: string
 *                 example: P-1001
 *               patient:
 *                 type: string
 *                 example: Alisher Usmonov
 *               doctor:
 *                 type: string
 *                 example: Dr. Jasur Azimov
 *               procedure:
 *                 type: string
 *                 example: Karies davolash
 *               amount:
 *                 type: integer
 *                 example: 350000
 *               method:
 *                 type: string
 *                 enum: [Naqd, Payme, Click, Uzcard, Humo, Bank]
 *                 example: Payme
 *               status:
 *                 type: string
 *                 enum: [paid, pending, partial, cancelled]
 *                 example: paid
 *     responses:
 *       201:
 *         description: Invoice created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/finance/invoices", authorize('owner', 'accountant'), validate(validateInvoice), financeController.createInvoice);

/**
 * @swagger
 * /api/finance/invoices/search:
 *   get:
 *     tags: [Finance]
 *     summary: Search invoices by patient or procedure
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query
 *     responses:
 *       200:
 *         description: Matching invoices
 *       400:
 *         description: Search query is required
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/finance/invoices/search", authorize('owner', 'accountant', 'administrator'), financeController.searchInvoice);

/**
 * @swagger
 * /api/finance/invoices/{id}:
 *   get:
 *     tags: [Finance]
 *     summary: Get invoice by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: Invoice details
 *       400:
 *         description: Invalid invoice ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Server error
 */
router.get("/finance/invoices/:id", authorize('owner', 'accountant', 'administrator'), financeController.getInvoiceById);

/**
 * @swagger
 * /api/finance/invoices/{id}:
 *   put:
 *     tags: [Finance]
 *     summary: Update invoice by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Invoice ID
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
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Invoice updated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Server error
 */
router.put("/finance/invoices/:id", authorize('owner', 'accountant'), validate(validateInvoice), financeController.updateInvoice);

/**
 * @swagger
 * /api/finance/invoices/{id}/status:
 *   patch:
 *     tags: [Finance]
 *     summary: Update invoice payment status
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Invoice ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [paid, pending, partial, cancelled]
 *     responses:
 *       200:
 *         description: Status updated
 *       400:
 *         description: Invalid status value
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Server error
 */
router.patch("/finance/invoices/:id/status", authorize('owner', 'accountant'), financeController.updateStatus);

/**
 * @swagger
 * /api/finance/invoices/{id}:
 *   delete:
 *     tags: [Finance]
 *     summary: Delete invoice by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: Invoice deleted
 *       400:
 *         description: Invalid invoice ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Server error
 */
router.delete("/finance/invoices/:id", authorize('owner', 'accountant'), financeController.deleteInvoice);

module.exports = router;
