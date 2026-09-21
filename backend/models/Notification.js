'use strict';

const { DataTypes } = require('sequelize');

/**
 * Notification — tracks sent and pending notifications.
 * Supports SMS (Eskiz), Telegram Bot, and in-app channels.
 */
module.exports = (sequelize) => {
  const Notification = sequelize.define(
    'Notification',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      clinicId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'clinics', key: 'id' },
      },
      recipientId: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Patient ID (P-xxxx) or null for staff-only notifications',
      },
      channel: {
        type: DataTypes.ENUM('sms', 'telegram', 'in_app'),
        defaultValue: 'in_app',
      },
      type: {
        type: DataTypes.STRING(60),
        allowNull: false,
        comment:
          'e.g. "appointment_reminder", "payment_due", "appointment_created"',
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'sent', 'failed', 'read'),
        defaultValue: 'pending',
      },
      sentAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSONB,
        defaultValue: {},
        comment: 'Extra data, e.g. appointmentId, messageId from Eskiz',
      },
    },
    {
      tableName: 'notifications',
    }
  );

  Notification.associate = (models) => {
    Notification.belongsTo(models.Clinic, { foreignKey: 'clinicId', as: 'clinic' });
  };

  return Notification;
};
