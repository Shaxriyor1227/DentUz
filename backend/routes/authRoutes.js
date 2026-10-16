const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const authController = require("../controller/authController");
const { authenticate } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { validateRegistration, validateLogin } = require("../validations/userValidation");

// Rate limiter for login: max 10 requests per 15 minutes per IP + identifier
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const id = (req.body && (req.body.identifier || req.body.email || req.body.login || req.body.username)) || '';
    return `${req.ip}_${id.toLowerCase().trim()}`;
  },
  validate: false,
  message: { success: false, message: 'Juda ko\'p login urinishlari. 15 daqiqadan keyin qayta urinib ko\'ring.' },
});

// Rate limiter for token refresh: max 30 requests per 15 minutes per IP
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Juda ko\'p token yangilash so\'rovlari. Iltimos, keyinroq qayta urinib ko\'ring.' },
});

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication, login and token management
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Yangi klinika egasini ro'yxatdan o'tkazish
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
 *                 example: Dr. Jasur Azimov
 *               email:
 *                 type: string
 *                 example: j.azimov@dentuz.uz
 *               password:
 *                 type: string
 *                 example: Password123!
 *     responses:
 *       201:
 *         description: Ro'yxatdan o'tish muvaffaqiyatli
 *       400:
 *         description: Validatsiya xatosi yoki zaif parol
 *       409:
 *         description: Email allaqachon mavjud
 */
router.post("/register", loginLimiter, validate(validateRegistration), authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Tizimga kirish
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: j.azimov@dentuz.uz
 *               password:
 *                 type: string
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Login muvaffaqiyatli
 *       401:
 *         description: Noto'g'ri login yoki parol
 *       429:
 *         description: Bloklandi (brute-force)
 */
router.post("/login", loginLimiter, validate(validateLogin), authController.login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Access tokenni yangilash (Refresh Token Rotation)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Yangi tokenlar
 *       401:
 *         description: Token yaroqsiz yoki qayta ishlatilgan
 */
router.post("/refresh", refreshLimiter, authController.refresh);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Tizimdan chiqish (sessiyani bekor qilish)
 *     responses:
 *       200:
 *         description: Muvaffaqiyatli chiqildi
 */
router.post("/logout", authenticate, authController.logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Joriy foydalanuvchi ma'lumotlarini olish
 *     responses:
 *       200:
 *         description: Foydalanuvchi profili
 */
router.get("/me", authenticate, authController.me);

module.exports = router;
