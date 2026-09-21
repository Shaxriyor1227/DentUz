module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define(
    'Payment',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      invoiceId: {
        type: DataTypes.STRING,
        allowNull: true,
        references: { model: 'invoices', key: 'id' },
      },
      patientId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: { model: 'patients', key: 'id' },
      },
      amount: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
      },
      method: {
        type: DataTypes.ENUM('Naqd', 'Payme', 'Click', 'Uzcard', 'Humo', 'Bank'),
        defaultValue: 'Naqd',
      },
      transactionDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      receiptNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      receivedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      clinicId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'clinics', key: 'id' },
      },
    },
    {
      tableName: 'payments',
      timestamps: true,
    }
  );

  Payment.associate = (models) => {
    Payment.belongsTo(models.Invoice, { foreignKey: 'invoiceId', as: 'invoice' });
    Payment.belongsTo(models.Patient, { foreignKey: 'patientId', as: 'patient' });
    Payment.belongsTo(models.User, { foreignKey: 'receivedBy', as: 'receiver' });
    Payment.belongsTo(models.Clinic, { foreignKey: 'clinicId', as: 'clinic' });
  };

  return Payment;
};
