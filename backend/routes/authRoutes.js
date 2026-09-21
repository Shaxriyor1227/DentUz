'use strict';

const router = require('express').Router();
const { login, refresh, logout, me } = require('../controller/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { body } = require('express-validator');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: JWT authentication
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email + password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Returns accessToken, refreshToken, user object
 */
router.post(
  '/login',
  [body('email').isEmail().withMessage('Email noto\'g\'ri'), body('password').notEmpty().withMessage('Parol talab etiladi')],
  validate,
  login
);

router.post('/refresh', [body('refreshToken').notEmpty()], validate, refresh);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);

module.exports = router;
