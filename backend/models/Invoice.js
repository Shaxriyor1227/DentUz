'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Invoice = sequelize.define(
    'Invoice',
    {
      id: {
        type: DataTypes.STRING(30),
        primaryKey: true,
        comment: 'Human-readable ID, e.g. "INV-2026-001"',
      },
      patientId: {
        type: DataTypes.STRING(20),
        allowNull: true,
        references: { model: 'patients', key: 'id' },
      },
      patient: {
        type: DataTypes.STRING(120),
        allowNull: true,
        comment: 'Denormalized patient name',
      },
      doctor: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Denormalized doctor short name',
      },
      procedure: {
        type: DataTypes.STRING(300),
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
        comment: 'Amount in UZS (sum)',
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
  };

  return Invoice;
};
