const express = require('express');
const router = express.Router();
const superAdminController = require('../controller/superAdminController');

/**
 * @swagger
 * tags:
 *   name: SuperAdmin
 *   description: DentUz SaaS Platforma Egasi (SuperAdmin) boshqaruv paneli API
 */

/**
 * @swagger
 * /api/superadmin/stats:
 *   get:
 *     tags: [SuperAdmin]
 *     summary: Butun platformaning umumiy statistikasi (Klinikalar, arizalar, MRR)
 *     responses:
 *       200:
 *         description: Platforma statistikasi
 *       500:
 *         description: Server xatosi
 */
router.get('/stats', superAdminController.getStats);

/**
 * @swagger
 * /api/superadmin/applications:
 *   get:
 *     tags: [SuperAdmin]
 *     summary: Saytdan tushgan barcha arizalar (Demo so'rovlari)
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [new, contacted, approved, rejected]
 *         description: Status bo'yicha filter
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Ism, klinika yoki telefon bo'yicha qidirish
 *     responses:
 *       200:
 *         description: Arizalar ro'yxati
 */
router.get('/applications', superAdminController.getApplications);

/**
 * @swagger
 * /api/superadmin/clinics:
 *   get:
 *     tags: [SuperAdmin]
 *     summary: Ro'yxatdan o'tgan barcha klinikalar va ularning holati
 *     responses:
 *       200:
 *         description: Klinikalar ro'yxati
 */
router.get('/clinics', superAdminController.getClinics);

/**
 * @swagger
 * /api/superadmin/clinics/onboard:
 *   post:
 *     tags: [SuperAdmin]
 *     summary: Yangi klinika va uning egasiga (Owner) 1 bosishda hisob ochish
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - ownerName
 *               - email
 *               - phone
 *             properties:
 *               applicationId:
 *                 type: string
 *                 format: uuid
 *                 description: Tasdiqlanayotgan ariza ID si (ixtiyoriy)
 *               name:
 *                 type: string
 *                 example: Stoma Dental Care
 *               ownerName:
 *                 type: string
 *                 example: Dr. Jasur Azimov
 *               email:
 *                 type: string
 *                 example: jasur@stomadental.uz
 *               phone:
 *                 type: string
 *                 example: +998 90 123 45 67
 *               chairsCount:
 *                 type: integer
 *                 example: 3
 *               subscriptionPlan:
 *                 type: string
 *                 enum: [starter, pro, enterprise]
 *                 example: pro
 *               address:
 *                 type: string
 *                 example: Toshkent, Chilonzor 9
 *               password:
 *                 type: string
 *                 example: Secret123!
 *     responses:
 *       201:
 *         description: Klinika va uning egasi (Owner) yaratildi, kirish ma'lumotlari qaytarildi
 *       400:
 *         description: Noto'g'ri ma'lumot yoki email band
 *       500:
 *         description: Server xatosi
 */
router.post('/clinics/onboard', superAdminController.onboardClinic);

/**
 * @swagger
 * /api/superadmin/clinics/{id}/status:
 *   patch:
 *     tags: [SuperAdmin]
 *     summary: Klinika holatini o'zgartirish (active / suspended / trial)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *                 enum: [active, suspended, trial, cancelled]
 *     responses:
 *       200:
 *         description: Status yangilandi
 */
router.patch('/clinics/:id/status', superAdminController.updateClinicStatus);

/**
 * @swagger
 * /api/superadmin/clinics/{id}/plan:
 *   patch:
 *     tags: [SuperAdmin]
 *     summary: Klinika obuna tarifini va muddatini uzaytirish
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subscriptionPlan:
 *                 type: string
 *                 enum: [starter, pro, enterprise]
 *               additionalMonths:
 *                 type: integer
 *                 example: 12
 *     responses:
 *       200:
 *         description: Obuna yangilandi
 */
router.patch('/clinics/:id/plan', superAdminController.updateClinicPlan);

module.exports = router;
