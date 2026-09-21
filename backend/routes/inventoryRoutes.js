const express = require('express');
const router = express.Router();
const inventoryController = require('../controller/inventoryController');

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
router.post('/inventory', inventoryController.createInventory);

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     tags: [Inventory]
 *     summary: Get all inventory items (supports lowStock filter and category)
 *     parameters:
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
 *     responses:
 *       200:
 *         description: List of inventory items
 *       500:
 *         description: Server error
 */
router.get('/inventory', inventoryController.getInventories);

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
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
router.get('/inventory/:id', inventoryController.getInventoryById);

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
router.put('/inventory/:id', inventoryController.updateInventory);

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
router.patch('/inventory/:id/adjust', inventoryController.adjustQuantity);

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
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 */
router.delete('/inventory/:id', inventoryController.deleteInventory);

module.exports = router;
