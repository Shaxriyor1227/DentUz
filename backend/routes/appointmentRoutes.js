const express = require("express");
const router = express.Router();
const appointmentController = require("../controller/appointmentsController");
const { validate } = require("../middleware/validate");
const { validateAppointment } = require("../validations/appointmentValidation");

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Appointment scheduling & calendar management
 */

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     tags: [Appointments]
 *     summary: Create a new appointment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - time
 *               - patientId
 *               - date
 *             properties:
 *               id:
 *                 type: string
 *                 example: apt-10
 *               time:
 *                 type: string
 *                 example: "10:30"
 *               duration:
 *                 type: integer
 *                 example: 45
 *               patientId:
 *                 type: string
 *                 example: P-1001
 *               patientName:
 *                 type: string
 *                 example: Alisher Usmonov
 *               procedure:
 *                 type: string
 *                 example: Karies davolash
 *               doctorId:
 *                 type: string
 *               doctorName:
 *                 type: string
 *                 example: Dr. Jasur Azimov
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2026-03-22"
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed, cancelled]
 *                 example: pending
 *               chair:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Appointment created
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post("/appointments", validate(validateAppointment), appointmentController.createAppointment);

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     tags: [Appointments]
 *     summary: Get all appointments
 *     responses:
 *       200:
 *         description: List of appointments
 *       500:
 *         description: Server error
 */
router.get("/appointments", appointmentController.getAppointments);

/**
 * @swagger
 * /api/appointments/today:
 *   get:
 *     tags: [Appointments]
 *     summary: Get today's appointments
 *     responses:
 *       200:
 *         description: Today's appointment list
 *       500:
 *         description: Server error
 */
router.get("/appointments/today", appointmentController.getTodayAppointments);

/**
 * @swagger
 * /api/appointments/search:
 *   get:
 *     tags: [Appointments]
 *     summary: Search appointments by patient name or procedure
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: Search term
 *     responses:
 *       200:
 *         description: Filtered appointment list
 *       400:
 *         description: Search query is required
 *       500:
 *         description: Server error
 */
router.get("/appointments/search", appointmentController.searchAppointment);

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     tags: [Appointments]
 *     summary: Get appointment by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment details
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
router.get("/appointments/:id", appointmentController.getAppointmentById);

/**
 * @swagger
 * /api/appointments/{id}:
 *   put:
 *     tags: [Appointments]
 *     summary: Update appointment by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               time:
 *                 type: string
 *               duration:
 *                 type: integer
 *               procedure:
 *                 type: string
 *               status:
 *                 type: string
 *               chair:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Appointment updated
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
router.put("/appointments/:id", validate(validateAppointment), appointmentController.updateAppointment);

/**
 * @swagger
 * /api/appointments/{id}:
 *   delete:
 *     tags: [Appointments]
 *     summary: Delete appointment by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment deleted
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
router.delete("/appointments/:id", appointmentController.deleteAppointment);

module.exports = router;
