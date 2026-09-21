module.exports = (sequelize, DataTypes) => {
  const Invoice = sequelize.define(
    'Invoice',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      patientId: {
        type: DataTypes.STRING,
        allowNull: true,
        references: { model: 'patients', key: 'id' },
      },
      patient: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      doctor: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      procedure: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      method: {
        type: DataTypes.ENUM('Naqd', 'Payme', 'Click', 'Uzcard', 'Humo', 'Bank'),
        defaultValue: 'Naqd',
      },
      amount: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.ENUM('paid', 'pending', 'partial', 'cancelled'),
        defaultValue: 'pending',
      },
      clinicId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'clinics', key: 'id' },
      },
    },
    {
      tableName: 'invoices',
    }
  );

  Invoice.associate = (models) => {
    Invoice.belongsTo(models.Patient, { foreignKey: 'patientId', as: 'patientRecord' });
    Invoice.belongsTo(models.Clinic, { foreignKey: 'clinicId', as: 'clinic' });
    Invoice.hasMany(models.Payment, { foreignKey: 'invoiceId', as: 'payments' });
  };

  return Invoice;
};
