module.exports = (sequelize, DataTypes) => {
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
        type: DataTypes.STRING,
        allowNull: true,
      },
      channel: {
        type: DataTypes.ENUM('sms', 'telegram', 'in_app'),
        defaultValue: 'in_app',
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
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
