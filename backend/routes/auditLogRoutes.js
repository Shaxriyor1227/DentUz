const express = require('express');
const router = express.Router();
const auditLogController = require('../controller/auditLogController');
const { authorize } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: AuditLogs
 *   description: Security audit trails and compliance logging
 */

/**
 * @swagger
 * /api/audit-logs:
 *   get:
 *     tags: [AuditLogs]
 *     summary: Klinika faoliyat jurnali (faqat owner va administrator uchun)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *       - in: query
 *         name: resource
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Audit loglar ro'yxati
 *       403:
 *         description: Ruxsat berilmagan rol
 */
router.get('/audit-logs', authorize('owner', 'administrator', 'superadmin'), auditLogController.getAuditLogs);

module.exports = router;
