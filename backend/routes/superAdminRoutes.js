const express = require('express');
const router = express.Router();
const superAdminController = require('../controller/superAdminController');
const { authenticate, authorize } = require('../middleware/auth');

// Protect all SuperAdmin endpoints - Only users with role 'superadmin' can access
router.use(authenticate, authorize('superadmin'));

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
router.patch('/applications/:id/status', superAdminController.updateApplicationStatus);
router.delete('/applications/:id', superAdminController.deleteApplication);

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

/**
 * @swagger
 * /api/superadmin/users:
 *   get:
 *     tags: [SuperAdmin]
 *     summary: Barcha foydalanuvchilar va xodimlar ro'yxatini olish (RBAC / Kirish huquqlari)
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [all, superadmin, owner, doctor, receptionist, nurse]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Foydalanuvchilar ro'yxati
 */
router.get('/users', superAdminController.getUsers);

/**
 * @swagger
 * /api/superadmin/users:
 *   post:
 *     tags: [SuperAdmin]
 *     summary: Yangi xodim yoki boshqaruvchi yaratish
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
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [superadmin, owner, doctor, receptionist, nurse]
 *               clinicId:
 *                 type: string
 *                 format: uuid
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Foydalanuvchi yaratildi
 */
router.post('/users', superAdminController.createUser);

/**
 * @swagger
 * /api/superadmin/users/{id}/status:
 *   patch:
 *     tags: [SuperAdmin]
 *     summary: Foydalanuvchini bloklash yoki faollashtirish (Kirish huquqini boshqarish)
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
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Status yangilandi
 */
router.patch('/users/:id/status', superAdminController.updateUserStatus);

/**
 * @swagger
 * /api/superadmin/users/{id}/role:
 *   patch:
 *     tags: [SuperAdmin]
 *     summary: Foydalanuvchi rolini o'zgartirish
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
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [superadmin, owner, doctor, receptionist, nurse]
 *     responses:
 *       200:
 *         description: Rol yangilandi
 */
router.patch('/users/:id/role', superAdminController.updateUserRole);

/**
 * @swagger
 * /api/superadmin/users/{id}/password:
 *   patch:
 *     tags: [SuperAdmin]
 *     summary: Foydalanuvchi parolini yangilash (Parolni tiklash)
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
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Parol muvaffaqiyatli yangilandi
 */
router.patch('/users/:id/password', superAdminController.updateUserPassword);

/**
 * @swagger
 * /api/superadmin/users/{id}:
 *   delete:
 *     tags: [SuperAdmin]
 *     summary: Foydalanuvchini tizimdan o'chirish
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: O'chirildi
 */
router.delete('/users/:id', superAdminController.deleteUser);

module.exports = router;
