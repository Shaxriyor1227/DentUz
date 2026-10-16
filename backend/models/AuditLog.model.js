module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define(
    'AuditLog',
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
      userId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      userEmail: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      userRole: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      action: {
        type: DataTypes.STRING(32),
        allowNull: false, // 'CREATE', 'READ', 'UPDATE', 'DELETE'
      },
      resource: {
        type: DataTypes.STRING(64),
        allowNull: false, // 'Patient', 'MedicalRecord', 'Payment', 'Invoice', 'User'
      },
      resourceId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ip: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      userAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
    },
    {
      tableName: 'audit_logs',
      timestamps: true,
      updatedAt: false, // Audit logs are immutable append-only
      indexes: [
        { fields: ['clinicId'] },
        { fields: ['userId'] },
        { fields: ['resource', 'resourceId'] },
        { fields: ['createdAt'] },
      ],
    }
  );

  AuditLog.associate = (models) => {
    AuditLog.belongsTo(models.Clinic, { foreignKey: 'clinicId', as: 'clinic' });
    AuditLog.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return AuditLog;
};
