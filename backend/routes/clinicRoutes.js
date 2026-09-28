const express = require("express");
const router = express.Router();
const clinicController = require("../controller/clinicController");
const { validate } = require("../middleware/validate");
const { validateClinic } = require("../validations/clinicValidation");

/**
 * @swagger
 * tags:
 *   name: Clinics
 *   description: Klinika boshqaruvi
 */

/**
 * @swagger
 * /api/clinics:
 *   get:
 *     tags: [Clinics]
 *     summary: Barcha klinikalarni olish
 *     responses:
 *       200:
 *         description: Klinikalar ro'yxati
 *       500:
 *         description: Server xatosi
 */
router.get("/clinics", clinicController.getClinics);

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
 *                 example: +998 90 123 45 67
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
 *         description: Ism va telefon raqami majburiy
 *       500:
 *         description: Server xatosi
 */
router.post("/clinics/apply", clinicController.submitApplication);

/**
 * @swagger
 * /api/clinics/applications:
 *   get:
 *     tags: [Clinics]
 *     summary: Barcha klinika ulanish arizalarini olish (Admin)
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Server xatosi
 */
router.get("/clinics/applications", clinicController.getApplications);

/**
 * @swagger
 * /api/clinics/applications/{id}/status:
 *   patch:
 *     tags: [Clinics]
 *     summary: Ariza holatini yangilash (Admin)
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
 *       404:
 *         description: Ariza topilmadi
 *       500:
 *         description: Server xatosi
 */
router.patch("/clinics/applications/:id/status", clinicController.updateApplicationStatus);

/**
 * @swagger
 * /api/clinics/{id}:
 *   get:
 *     tags: [Clinics]
 *     summary: ID bo'yicha klinikani olish
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
 *       404:
 *         description: Topilmadi
 *       500:
 *         description: Server xatosi
 */
router.get("/clinics/:id", clinicController.getClinicById);

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
 *       500:
 *         description: Server xatosi
 */
router.get("/clinics/:id/stats", clinicController.getClinicStats);

/**
 * @swagger
 * /api/clinics:
 *   post:
 *     tags: [Clinics]
 *     summary: Yangi klinika yaratish
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
 *       500:
 *         description: Server xatosi
 */
router.post("/clinics", validate(validateClinic), clinicController.createClinic);

/**
 * @swagger
 * /api/clinics/{id}:
 *   put:
 *     tags: [Clinics]
 *     summary: Klinikani yangilash
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
 *       404:
 *         description: Topilmadi
 *       500:
 *         description: Server xatosi
 */
router.put("/clinics/:id", validate(validateClinic), clinicController.updateClinic);

/**
 * @swagger
 * /api/clinics/{id}:
 *   delete:
 *     tags: [Clinics]
 *     summary: Klinikani o'chirish
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
 *       404:
 *         description: Topilmadi
 *       500:
 *         description: Server xatosi
 */
router.delete("/clinics/:id", clinicController.deleteClinic);

module.exports = router;

