'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Appointment = sequelize.define(
    'Appointment',
    {
      id: {
        type: DataTypes.STRING(30),
        primaryKey: true,
        comment: 'Human-readable ID, e.g. "apt-1"',
      },
      time: {
        type: DataTypes.STRING(5),
        allowNull: false,
        comment: 'Start time in "HH:MM" format',
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30,
        comment: 'Duration in minutes',
      },
      patientId: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: { model: 'patients', key: 'id' },
      },
      patientName: {
        type: DataTypes.STRING(120),
        allowNull: true,
        comment: 'Denormalized for quick calendar render',
      },
      procedure: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      doctorId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'doctors', key: 'id' },
      },
      doctorSlug: {
        type: DataTypes.STRING(80),
        allowNull: true,
        comment: 'Slug key used in frontend mock, e.g. "azimov"',
      },
      doctorName: {
        type: DataTypes.STRING(120),
        allowNull: true,
        comment: 'Denormalized for quick calendar render',
      },
      status: {
        type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
        defaultValue: 'pending',
      },
      day: {
        type: DataTypes.STRING(3),
        allowNull: true,
        comment: 'Day abbreviation: mon, tue, wed, thu, fri, sat, sun',
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      chair: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      color: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: 'Hex color for calendar card',
      },
      clinicId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'clinics', key: 'id' },
      },
    },
    {
      tableName: 'appointments',
    }
  );

  Appointment.associate = (models) => {
    Appointment.belongsTo(models.Patient, { foreignKey: 'patientId', as: 'patient' });
    Appointment.belongsTo(models.Doctor, { foreignKey: 'doctorId', as: 'doctor' });
    Appointment.belongsTo(models.Clinic, { foreignKey: 'clinicId', as: 'clinic' });
  };

  return Appointment;
};
