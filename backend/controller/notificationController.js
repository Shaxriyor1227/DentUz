const { Notification, Clinic } = require("../models");
const { validateNotification } = require("../validations/notificationValidation");
const { Op } = require("sequelize");

// GET /api/notifications?clinicId=...&recipientId=...
exports.getNotifications = async (req, res) => {
    try {
        const { clinicId, recipientId, status, channel } = req.query;

        const where = {};
        if (clinicId)     where.clinicId     = clinicId;
        if (recipientId)  where.recipientId  = recipientId;
        if (status)       where.status       = status;
        if (channel)      where.channel      = channel;

        const notifications = await Notification.findAll({
            where,
            include: [{ model: Clinic, as: "clinic", attributes: ["id", "name"] }],
            order: [["createdAt", "DESC"]],
        });

        res.status(200).send(notifications);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// GET /api/notifications/:id
exports.getNotificationById = async (req, res) => {
    try {
        const notification = await Notification.findByPk(req.params.id, {
            include: [{ model: Clinic, as: "clinic", attributes: ["id", "name"] }],
        });
        if (!notification) return res.status(404).send("Notification not found");
        res.status(200).send(notification);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// POST /api/notifications
exports.createNotification = async (req, res) => {
    const { error } = validateNotification(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const notification = await Notification.create(req.body);
        res.status(201).send(notification);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// PUT /api/notifications/:id/read  — bitta bildirishnomani o'qildi deb belgilash
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByPk(req.params.id);
        if (!notification) return res.status(404).send("Notification not found");

        await notification.update({ status: "read", sentAt: new Date() });
        res.status(200).send(notification);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// PUT /api/notifications/read-all  — berilgan recipientId uchun hammasini o'qildi
exports.markAllAsRead = async (req, res) => {
    try {
        const { recipientId, clinicId } = req.body;

        const where = { status: { [Op.ne]: "read" } };
        if (recipientId) where.recipientId = recipientId;
        if (clinicId)    where.clinicId    = clinicId;

        const [count] = await Notification.update(
            { status: "read", sentAt: new Date() },
            { where }
        );

        res.status(200).send({ updated: count });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// DELETE /api/notifications/:id
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findByPk(req.params.id);
        if (!notification) return res.status(404).send("Notification not found");

        const data = notification.toJSON();
        await notification.destroy();
        res.status(200).send(data);
    } catch (error) {
        res.status(500).send(error.message);
    }
};
