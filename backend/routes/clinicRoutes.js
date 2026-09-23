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
