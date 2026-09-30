const express = require('express');
const router = express.Router();
const inventoryController = require('../controller/inventoryController');
const { validate } = require('../middleware/validate');
const { validateInventory } = require('../validations/inventoryValidation');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Clinic inventory, dental materials, medications and stock management
 */

/**
 * @swagger
 * /api/inventory:
 *   post:
 *     tags: [Inventory]
 *     summary: Create a new inventory item
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Anesteziya Septanest 1:100000"
 *               category:
 *                 type: string
 *                 enum: [consumable, implant, ortho, instrument, medication, hygiene, other]
 *                 example: medication
 *               sku:
 *                 type: string
 *                 example: "MED-SEPT-01"
 *               unit:
 *                 type: string
 *                 enum: [dona, quti, flakon, gramm, millilitr, komplekt]
 *                 example: quti
 *               quantity:
 *                 type: integer
 *                 example: 25
 *               minQuantity:
 *                 type: integer
 *                 example: 5
 *               costPerUnit:
 *                 type: integer
 *                 example: 120000
 *               supplier:
 *                 type: string
 *                 example: "DentMarket LLC"
 *               supplierPhone:
 *                 type: string
 *                 example: "+998 71 200 00 00"
 *               expiryDate:
 *                 type: string
 *                 format: date
 *                 example: "2027-12-31"
 *     responses:
 *       201:
 *         description: Inventory item created
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/inventory', authorize('owner', 'administrator'), validate(validateInventory), inventoryController.createInventory);

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     tags: [Inventory]
 *     summary: Get all inventory items (supports search, category, lowStock filter, pagination)
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by item name, SKU, or supplier
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter category (consumable, medication, etc.)
 *       - in: query
 *         name: lowStock
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter items where quantity <= minQuantity
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
 *         description: List of inventory items
 *       500:
 *         description: Server error
 */
router.get('/inventory', authorize('owner', 'administrator', 'doctor'), inventoryController.getInventories);

/**
 * @swagger
 * /api/inventory/search:
 *   get:
 *     tags: [Inventory]
 *     summary: Search inventory by name, SKU, or supplier
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Matching inventory items
 *       400:
 *         description: Search query is required
 *       500:
 *         description: Server error
 */
router.get('/inventory/search', authorize('owner', 'administrator', 'doctor'), inventoryController.searchInventory);

/**
 * @swagger
 * /api/inventory/{id}:
 *   get:
 *     tags: [Inventory]
 *     summary: Get inventory item by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Inventory item UUID
 *     responses:
 *       200:
 *         description: Inventory item details
 *       400:
 *         description: Invalid inventory ID
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
router.get('/inventory/:id', authorize('owner', 'administrator', 'doctor'), inventoryController.getInventoryById);

/**
 * @swagger
 * /api/inventory/{id}:
 *   put:
 *     tags: [Inventory]
 *     summary: Update inventory item by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Inventory item UUID
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
 *               quantity:
 *                 type: integer
 *               minQuantity:
 *                 type: integer
 *               costPerUnit:
 *                 type: integer
 *               supplier:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inventory item updated
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
router.put('/inventory/:id', authorize('owner', 'administrator'), validate(validateInventory), inventoryController.updateInventory);

/**
 * @swagger
 * /api/inventory/{id}/adjust:
 *   patch:
 *     tags: [Inventory]
 *     summary: Quick adjust stock quantity (increase/decrease)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Inventory item UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - delta
 *             properties:
 *               delta:
 *                 type: integer
 *                 example: -2
 *                 description: Quantity adjustment (positive to add, negative to subtract)
 *     responses:
 *       200:
 *         description: Stock adjusted successfully
 *       400:
 *         description: Invalid delta
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
router.patch('/inventory/:id/adjust', authorize('owner', 'administrator'), inventoryController.adjustQuantity);

/**
 * @swagger
 * /api/inventory/{id}:
 *   delete:
 *     tags: [Inventory]
 *     summary: Delete inventory item by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Inventory item UUID
 *     responses:
 *       200:
 *         description: Inventory item deleted
 *       400:
 *         description: Invalid inventory ID
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
router.delete('/inventory/:id', authorize('owner', 'administrator'), inventoryController.deleteInventory);

module.exports = router;
