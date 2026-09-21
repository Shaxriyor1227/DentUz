const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     tags: [Users]
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 example: Dr. Jasur Azimov
 *               email:
 *                 type: string
 *                 example: j.azimov@dentuz.uz
 *               password:
 *                 type: string
 *                 example: Password123!
 *               role:
 *                 type: string
 *                 enum: [owner, doctor, receptionist, nurse]
 *                 example: doctor
 *               phone:
 *                 type: string
 *                 example: +998 90 123 45 67
 *               title:
 *                 type: string
 *                 example: Ortodont
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post("/users", userController.createUser);

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: List of users
 *       500:
 *         description: Server error
 */
router.get("/users", userController.getUsers);

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     tags: [Users]
 *     summary: Search users by name or email
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query for user name or email
 *     responses:
 *       200:
 *         description: List of users matching the search query
 *       400:
 *         description: Search query is required
 *       500:
 *         description: Server error
 */
router.get("/users/search", userController.searchUser);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get("/users/:id", userController.getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Update user by ID
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
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *               phone:
 *                 type: string
 *               title:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put("/users/:id", userController.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete("/users/:id", userController.deleteUser);

module.exports = router;
