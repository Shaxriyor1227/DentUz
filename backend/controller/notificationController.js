'use strict';

const { Notification, Clinic } = require('../models');
const { validateNotification } = require('../validations/notificationValidation');
const { Op } = require('sequelize');

exports.getNotifications = async (req, res) => {
  try {
    const { clinicId, recipientId, status, channel } = req.query;
    const where = {};

    if (clinicId)    where.clinicId    = clinicId;
    if (recipientId) where.recipientId = recipientId;
    if (status)      where.status      = status;
    if (channel)     where.channel     = channel;

    const notifications = await Notification.findAll({
      where,
      include: [{ model: Clinic, as: 'clinic', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id, {
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
    const notification = await Notification.create(req.body);
    res.status(201).json({ success: true, data: notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) return res.status(404).json({ success: false, message: 'Bildirishnoma topilmadi' });

    await notification.update({ status: 'read', sentAt: new Date() });
    res.status(200).json({ success: true, data: notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const { recipientId, clinicId } = req.body;
    const where = { status: { [Op.ne]: 'read' } };

    if (recipientId) where.recipientId = recipientId;
    if (clinicId)    where.clinicId    = clinicId;

    const [count] = await Notification.update(
      { status: 'read', sentAt: new Date() },
      { where }
    );

    res.status(200).json({ success: true, data: { updated: count } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) return res.status(404).json({ success: false, message: 'Bildirishnoma topilmadi' });

    const data = notification.toJSON();
    await notification.destroy();
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
