const express = require("express");
const router = express.Router();
const teamController = require("../controller/teamController");
const { validate } = require("../middleware/validate");
const { validateUser } = require("../validations/userValidation");
const { authorize } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Team
 *   description: Staff and doctor management
 */

/**
 * @swagger
 * /api/team:
 *   get:
 *     tags: [Team]
 *     summary: Get all team members
 *     responses:
 *       200:
 *         description: List of team members
 *       500:
 *         description: Server error
 */
router.get("/team", authorize('owner', 'administrator', 'accountant'), teamController.getTeam);

/**
 * @swagger
 * /api/team:
 *   post:
 *     tags: [Team]
 *     summary: Add a new team member
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Dr. Malika Saidova
 *               email:
 *                 type: string
 *                 example: m.saidova@dentuz.uz
 *               password:
 *                 type: string
 *                 example: Password123!
 *               role:
 *                 type: string
 *                 enum: [owner, doctor, receptionist, nurse]
 *                 example: doctor
 *               title:
 *                 type: string
 *                 example: Ortodont
 *               phone:
 *                 type: string
 *                 example: +998 93 319 44 28
 *     responses:
 *       201:
 *         description: Team member created
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post("/team", authorize('owner'), validate(validateUser), teamController.addMember);

/**
 * @swagger
 * /api/team/search:
 *   get:
 *     tags: [Team]
 *     summary: Search team members by name or email
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query
 *     responses:
 *       200:
 *         description: List of matching members
 *       400:
 *         description: Search query is required
 *       500:
 *         description: Server error
 */
router.get("/team/search", authorize('owner', 'administrator', 'accountant'), teamController.searchMember);

/**
 * @swagger
 * /api/team/{id}:
 *   get:
 *     tags: [Team]
 *     summary: Get team member by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: Member details
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: Member not found
 *       500:
 *         description: Server error
 */
router.get("/team/:id", authorize('owner', 'administrator', 'accountant'), teamController.getMemberById);

/**
 * @swagger
 * /api/team/{id}:
 *   put:
 *     tags: [Team]
 *     summary: Update team member by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               title:
 *                 type: string
 *               role:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Member updated
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Member not found
 *       500:
 *         description: Server error
 */
router.put("/team/:id", authorize('owner'), validate(validateUser), teamController.updateMember);

/**
 * @swagger
 * /api/team/{id}:
 *   delete:
 *     tags: [Team]
 *     summary: Delete team member by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: Member deleted
 *       400:
 *         description: Invalid user ID
 *       403:
 *         description: Cannot delete clinic owner
 *       404:
 *         description: Member not found
 *       500:
 *         description: Server error
 */
router.delete("/team/:id", authorize('owner'), teamController.removeMember);

module.exports = router;
