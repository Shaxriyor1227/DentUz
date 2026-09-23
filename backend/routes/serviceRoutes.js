const express = require('express');
const router = express.Router();
const serviceController = require('../controller/serviceController');
const { validate } = require('../middleware/validate');
const { validateService } = require('../validations/serviceValidation');

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Clinic services and price list management
 */

/**
 * @swagger
 * /api/services:
 *   post:
 *     tags: [Services]
 *     summary: Create a new clinic service
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               id:
 *                 type: string
 *                 example: srv-101
 *               name:
 *                 type: string
 *                 example: "Tish plombalash (Fotopolimer)"
 *               category:
 *                 type: string
 *                 enum: [therapy, surgery, orthopedic, orthodontics, hygiene, diagnostic, other]
 *                 example: therapy
 *               code:
 *                 type: string
 *                 example: "TH-01"
 *               price:
 *                 type: integer
 *                 example: 250000
 *               costPrice:
 *                 type: integer
 *                 example: 80000
 *               durationMinutes:
 *                 type: integer
 *                 example: 45
 *               description:
 *                 type: string
 *                 example: "Kariesni tozalash va fotopolimer plomba qo'yish"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Service created successfully
 *       400:
 *         description: Invalid validation input
 *       500:
 *         description: Server error
 */
router.post('/services', validate(validateService), serviceController.createService);

/**
 * @swagger
 * /api/services:
 *   get:
 *     tags: [Services]
 *     summary: Get all services (with category and search filters)
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category (therapy, surgery, etc.)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by service name or code
 *       - in: query
 *         name: activeOnly
 *         schema:
 *           type: string
 *         description: Set to 'true' for only active services
 *     responses:
 *       200:
 *         description: List of services
 *       500:
 *         description: Server error
 */
router.get('/services', serviceController.getServices);

/**
 * @swagger
 * /api/services/{id}:
 *   get:
 *     tags: [Services]
 *     summary: Get service by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service details
 *       404:
 *         description: Service not found
 *       500:
 *         description: Server error
 */
router.get('/services/:id', serviceController.getServiceById);

/**
 * @swagger
 * /api/services/{id}:
 *   put:
 *     tags: [Services]
 *     summary: Update service by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               code:
 *                 type: string
 *               price:
 *                 type: integer
 *               costPrice:
 *                 type: integer
 *               durationMinutes:
 *                 type: integer
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Service updated
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Service not found
 *       500:
 *         description: Server error
 */
router.put('/services/:id', validate(validateService), serviceController.updateService);

/**
 * @swagger
 * /api/services/{id}:
 *   delete:
 *     tags: [Services]
 *     summary: Delete service by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service deleted
 *       404:
 *         description: Service not found
 *       500:
 *         description: Server error
 */
router.delete('/services/:id', serviceController.deleteService);

module.exports = router;
