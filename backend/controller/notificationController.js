const { Notification, Clinic } = require('../models');
const { validateNotification } = require('../validations/notificationValidation');
const { Op } = require('sequelize');
const { withTenantScope } = require('../utils/tenantScope');

exports.getNotifications = async (req, res) => {
  try {
    const { recipientId, status, channel, limit } = req.query;
    let where = {};

    if (recipientId) where.recipientId = recipientId;
    if (status)      where.status      = status;
    if (channel)     where.channel     = channel;

    // Strict multi-tenant isolation:
    // 1) Regular clinic staff: ONLY their clinic's notifications
    // 2) Superadmin with clinic context: that clinic's notifications
    // 3) Global Superadmin: system notifications or notifications addressed to them
    if (!req.isSuperAdmin) {
      where.clinicId = req.clinicId;
    } else if (req.clinicId) {
      where.clinicId = req.clinicId;
    } else if (req.query.clinicId) {
      where.clinicId = req.query.clinicId;
    } else {
      where[Op.or] = [
        { clinicId: null },
        { recipientId: String(req.user?.id) }
      ];
    }

    const queryLimit = parseInt(limit, 10) || 40;

    const [notifications, unreadCount] = await Promise.all([
      Notification.findAll({
        where,
        include: [{ model: Clinic, as: 'clinic', attributes: ['id', 'name'] }],
        order: [['createdAt', 'DESC']],
        limit: queryLimit,
      }),
      Notification.count({
        where: {
          ...where,
          status: { [Op.ne]: 'read' },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
      count: notifications.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: withTenantScope(req, { id: req.params.id }),
      include: [{ model: Clinic, as: 'clinic', attributes: ['id', 'name'] }],
    });
    if (!notification) return res.status(404).json({ success: false, message: 'Bildirishnoma topilmadi' });
    res.status(200).json({ success: true, data: notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createNotification = async (req, res) => {
  const { error } = validateNotification(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const notification = await Notification.create({
      ...req.body,
      clinicId: req.clinicId,
    });
    res.status(201).json({ success: true, data: notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: withTenantScope(req, { id: req.params.id }),
    });
    if (!notification) return res.status(404).json({ success: false, message: 'Bildirishnoma topilmadi' });

    await notification.update({ status: 'read', sentAt: new Date() });
    res.status(200).json({ success: true, data: notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    let where = { status: { [Op.ne]: 'read' } };
    if (req.body && req.body.recipientId) {
      where.recipientId = req.body.recipientId;
    }
    where = withTenantScope(req, where);

    const [updatedCount] = await Notification.update(
      { status: 'read', sentAt: new Date() },
      { where }
    );

    res.status(200).json({ success: true, count: updatedCount, message: "Barcha bildirishnomalar o'qildi deb belgilandi" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: withTenantScope(req, { id: req.params.id }),
    });
    if (!notification) return res.status(404).json({ success: false, message: 'Bildirishnoma topilmadi' });

    await notification.destroy();
    res.status(200).json({ success: true, message: 'Bildirishnoma o\'chirildi' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.clearAllNotifications = async (req, res) => {
  try {
    const where = withTenantScope(req, {});
    const deletedCount = await Notification.destroy({ where });
    res.status(200).json({
      success: true,
      count: deletedCount,
      message: 'Barcha bildirishnomalar tozalandi'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

