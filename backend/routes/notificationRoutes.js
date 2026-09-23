const express = require("express");
const router = express.Router();
const notificationController = require("../controller/notificationController");
const { validate } = require("../middleware/validate");
const { validateNotification } = require("../validations/notificationValidation");

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Bildirishnomalar boshqaruvi
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Barcha bildirishnomalarni olish
 *     parameters:
 *       - in: query
 *         name: clinicId
 *         schema:
 *           type: string
 *         description: Klinika ID si bo'yicha filter
 *       - in: query
 *         name: recipientId
 *         schema:
 *           type: string
 *         description: Qabul qiluvchi ID si
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, sent, failed, read]
 *         description: Status bo'yicha filter
 *       - in: query
 *         name: channel
 *         schema:
 *           type: string
 *           enum: [sms, telegram, in_app]
 *         description: Kanal bo'yicha filter
 *     responses:
 *       200:
 *         description: Bildirishnomalar ro'yxati
 *       500:
 *         description: Server xatosi
 */
router.get("/notifications", notificationController.getNotifications);

/**
 * @swagger
 * /api/notifications/{id}:
 *   get:
 *     tags: [Notifications]
 *     summary: ID bo'yicha bildirishnomani olish
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Bildirishnoma ID si
 *     responses:
 *       200:
 *         description: Bildirishnoma ma'lumotlari
 *       404:
 *         description: Topilmadi
 *       500:
 *         description: Server xatosi
 */
router.get("/notifications/:id", notificationController.getNotificationById);

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     tags: [Notifications]
 *     summary: Yangi bildirishnoma yaratish
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - body
 *             properties:
 *               type:
 *                 type: string
 *                 example: appointment_reminder
 *               title:
 *                 type: string
 *                 example: Eslatma
 *               body:
 *                 type: string
 *                 example: Sizning qabulingiz 15:00 da
 *               recipientId:
 *                 type: string
 *               clinicId:
 *                 type: string
 *               channel:
 *                 type: string
 *                 enum: [sms, telegram, in_app]
 *                 example: in_app
 *               status:
 *                 type: string
 *                 enum: [pending, sent, failed, read]
 *                 example: pending
 *     responses:
 *       201:
 *         description: Bildirishnoma yaratildi
 *       500:
 *         description: Server xatosi
 */
router.post("/notifications", validate(validateNotification), notificationController.createNotification);

/**
 * @swagger
 * /api/notifications/read-all:
 *   put:
 *     tags: [Notifications]
 *     summary: Barcha bildirishnomalarni o'qildi deb belgilash
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipientId:
 *                 type: string
 *               clinicId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Yangilangan yozuvlar soni
 *       500:
 *         description: Server xatosi
 */
router.put("/notifications/read-all", notificationController.markAllAsRead);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     tags: [Notifications]
 *     summary: Bitta bildirishnomani o'qildi deb belgilash
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Bildirishnoma ID si
 *     responses:
 *       200:
 *         description: Bildirishnoma o'qildi
 *       404:
 *         description: Topilmadi
 *       500:
 *         description: Server xatosi
 */
router.put("/notifications/:id/read", notificationController.markAsRead);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Bildirishnomani o'chirish
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Bildirishnoma ID si
 *     responses:
 *       200:
 *         description: O'chirildi
 *       404:
 *         description: Topilmadi
 *       500:
 *         description: Server xatosi
 */
router.delete("/notifications/:id", notificationController.deleteNotification);

module.exports = router;
