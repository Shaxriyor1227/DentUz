module.exports = (sequelize, DataTypes) => {
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
        type: DataTypes.STRING,
        allowNull: true,
      },
      cabinetNumber: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      workingHours: {
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
      tableName: 'doctors',
    }
  );

  Doctor.associate = (models) => {
    Doctor.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Doctor.belongsTo(models.Clinic, { foreignKey: 'clinicId', as: 'clinic' });
    Doctor.hasMany(models.Appointment, { foreignKey: 'doctorId', as: 'appointments' });
    Doctor.hasMany(models.TreatmentPlan, { foreignKey: 'doctorId', as: 'treatmentPlans' });
    Doctor.hasMany(models.MedicalRecord, { foreignKey: 'doctorId', as: 'medicalRecords' });
    Doctor.hasMany(models.LabOrder, { foreignKey: 'doctorId', as: 'labOrders' });
  };

  return Doctor;
};
