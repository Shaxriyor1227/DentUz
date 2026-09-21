'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Patient = sequelize.define(
    'Patient',
    {
      id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        comment: 'Human-readable ID, e.g. "P-1042"',
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(25),
        allowNull: true,
      },
      birthdate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      age: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Computed/cached age; recalculate from birthdate when needed',
      },
      lastVisit: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      lastProcedure: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      nextVisit: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('today', 'scheduled', 'debtor', 'all'),
        defaultValue: 'all',
      },
      allergies: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      balance: {
        type: DataTypes.BIGINT,
        defaultValue: 0,
        comment: 'Outstanding balance in UZS (sum)',
      },
      clinicId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'clinics', key: 'id' },
      },
    },
    {
      tableName: 'patients',
    }
  );

  Patient.associate = (models) => {
    Patient.belongsTo(models.Clinic, { foreignKey: 'clinicId', as: 'clinic' });
    Patient.hasMany(models.Appointment, { foreignKey: 'patientId', as: 'appointments' });
    Patient.hasMany(models.Invoice, { foreignKey: 'patientId', as: 'invoices' });
    Patient.hasOne(models.Odontogram, { foreignKey: 'patientId', as: 'odontogram' });
  };

  return Patient;
};
