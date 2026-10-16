const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const clinicController = require("../controller/clinicController");
const { validate } = require("../middleware/validate");
const { validateClinic } = require("../validations/clinicValidation");
const { authenticate, authorize } = require("../middleware/auth");
const { tenantMiddleware } = require("../middleware/tenantMiddleware");

// Rate-limiter for public application endpoint: max 5 requests per hour per IP
const applyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Arizalar soni oshib ketdi. Iltimos, 1 soatdan keyin qayta urinib ko'ring.",
  },
});

/**
 * @swagger
 * /api/clinics/apply:
 *   post:
 *     tags: [Clinics]
 *     summary: Yangi klinika ulanish arizasini yuborish (Public)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 example: Dr. Jasur Azimov
 *               clinicName:
 *                 type: string
 *                 example: DentUz Klinikasi
 *               phone:
 *                 type: string
 *                 example: +998901234567
 *               chairsCount:
 *                 type: string
 *                 example: 1-3
 *               message:
 *                 type: string
 *                 example: Klinika tizimiga ulanmoqchimiz
 *     responses:
 *       201:
 *         description: Ariza muvaffaqiyatli qabul qilindi va saqlandi
 *       400:
 *         description: Ism va telefon raqami majburiy yoki telefon formati noto'g'ri
 *       429:
 *         description: Juda ko'p so'rov yuborildi
 *       500:
 *         description: Server xatosi
 */
router.post("/clinics/apply", applyLimiter, clinicController.submitApplication);

// All subsequent routes require authentication and tenant isolation
router.use(authenticate, tenantMiddleware);

/**
 * @swagger
 * /api/clinics:
 *   get:
 *     tags: [Clinics]
 *     summary: Barcha klinikalarni olish (Faqat SuperAdmin)
 *     responses:
 *       200:
 *         description: Klinikalar ro'yxati
 *       403:
 *         description: Ruxsat yo'q
 *       500:
 *         description: Server xatosi
 */
router.get("/clinics", authorize('superadmin'), clinicController.getClinics);

/**
 * @swagger
 * /api/clinics/applications:
 *   get:
 *     tags: [Clinics]
 *     summary: Barcha klinika ulanish arizalarini olish (Faqat SuperAdmin)
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [new, contacted, approved, rejected]
 *         description: Arizalarni holati bo'yicha saralash
 *     responses:
 *       200:
 *         description: Barcha tushgan arizalar ro'yxati
 *       403:
 *         description: Ruxsat yo'q
 *       500:
 *         description: Server xatosi
 */
router.get("/clinics/applications", authorize('superadmin'), clinicController.getApplications);

/**
 * @swagger
 * /api/clinics/applications/{id}/status:
 *   patch:
 *     tags: [Clinics]
 *     summary: Ariza holatini yangilash (Faqat SuperAdmin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Ariza ID si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [new, contacted, approved, rejected]
 *                 example: contacted
 *     responses:
 *       200:
 *         description: Ariza holati yangilandi
 *       403:
 *         description: Ruxsat yo'q
 *       404:
 *         description: Ariza topilmadi
 *       500:
 *         description: Server xatosi
 */
router.patch("/clinics/applications/:id/status", authorize('superadmin'), clinicController.updateApplicationStatus);

/**
 * @swagger
 * /api/clinics/{id}:
 *   get:
 *     tags: [Clinics]
 *     summary: ID bo'yicha klinikani olish (SuperAdmin yoki ushbu klinika xodimi)
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Klinika ID si
 *     responses:
 *       200:
 *         description: Klinika ma'lumotlari
 *       403:
 *         description: Boshqa klinikaga kirish taqiqlangan
 *       404:
 *         description: Topilmadi
 *       500:
 *         description: Server xatosi
 */
router.get("/clinics/:id", authorize('superadmin', 'owner', 'administrator', 'doctor'), clinicController.getClinicById);

/**
 * @swagger
 * /api/clinics/{id}/stats:
 *   get:
 *     tags: [Clinics]
 *     summary: Klinika statistikasini olish
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Klinika ID si
 *     responses:
 *       200:
 *         description: Statistika (users, patients, appointments, invoices soni)
 *       403:
 *         description: Boshqa klinika statistikasiga kirish taqiqlanadi
 *       500:
 *         description: Server xatosi
 */
router.get("/clinics/:id/stats", authorize('superadmin', 'owner', 'administrator'), clinicController.getClinicStats);

/**
 * @swagger
 * /api/clinics:
 *   post:
 *     tags: [Clinics]
 *     summary: Yangi klinika yaratish (Faqat SuperAdmin)
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
 *                 example: DentUz Klinikasi
 *               address:
 *                 type: string
 *                 example: Toshkent, Yunusobod 5
 *               phone:
 *                 type: string
 *                 example: +998 71 200 00 01
 *               workingHours:
 *                 type: string
 *                 example: 09:00 - 18:00
 *               subscriptionPlan:
 *                 type: string
 *                 enum: [free, starter, pro, enterprise]
 *                 example: starter
 *     responses:
 *       201:
 *         description: Klinika yaratildi
 *       400:
 *         description: Noto'g'ri ma'lumot
 *       403:
 *         description: Faqat superadmin
 *       500:
 *         description: Server xatosi
 */
router.post("/clinics", authorize('superadmin'), validate(validateClinic), clinicController.createClinic);

/**
 * @swagger
 * /api/clinics/{id}:
 *   put:
 *     tags: [Clinics]
 *     summary: Klinikani yangilash (SuperAdmin yoki Klinika Rahbari)
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Klinika ID si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               workingHours:
 *                 type: string
 *               subscriptionPlan:
 *                 type: string
 *                 enum: [free, starter, pro, enterprise]
 *     responses:
 *       200:
 *         description: Yangilandi
 *       400:
 *         description: Noto'g'ri ma'lumot
 *       403:
 *         description: Ruxsat yo'q
 *       404:
 *         description: Topilmadi
 *       500:
 *         description: Server xatosi
 */
router.put("/clinics/:id", authorize('superadmin', 'owner'), validate(validateClinic), clinicController.updateClinic);

/**
 * @swagger
 * /api/clinics/{id}:
 *   delete:
 *     tags: [Clinics]
 *     summary: Klinikani o'chirish (Faqat SuperAdmin)
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Klinika ID si
 *     responses:
 *       200:
 *         description: O'chirildi
 *       403:
 *         description: Faqat superadmin
 *       404:
 *         description: Topilmadi
 *       500:
 *         description: Server xatosi
 */
router.delete("/clinics/:id", authorize('superadmin'), clinicController.deleteClinic);

module.exports = router;
