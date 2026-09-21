'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Doctor = sequelize.define(
    'Doctor',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
      },
      specialization: {
        type: DataTypes.STRING(120),
        allowNull: true,
        comment: 'e.g. "Ortodont", "Implantolog", "Terapevt-Stomatolog"',
      },
      cabinetNumber: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      workingHours: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'e.g. "09:00-18:00"',
      },
      clinicId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'clinics', key: 'id' },
      },
    },
    {
      tableName: 'doctors',
    }
  );

  Doctor.associate = (models) => {
    Doctor.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Doctor.belongsTo(models.Clinic, { foreignKey: 'clinicId', as: 'clinic' });
    Doctor.hasMany(models.Appointment, { foreignKey: 'doctorId', as: 'appointments' });
  };

  return Doctor;
};
