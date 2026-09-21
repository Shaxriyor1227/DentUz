module.exports = (sequelize, DataTypes) => {
  const Appointment = sequelize.define(
    'Appointment',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      time: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30,
      },
      patientId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: { model: 'patients', key: 'id' },
      },
      patientName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      procedure: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      doctorId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'doctors', key: 'id' },
      },
      doctorSlug: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      doctorName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
        defaultValue: 'pending',
      },
      day: {
        type: DataTypes.STRING,
        allowNull: true,
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
        type: DataTypes.STRING,
        allowNull: true,
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
