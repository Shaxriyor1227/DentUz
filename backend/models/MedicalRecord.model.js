module.exports = (sequelize, DataTypes) => {
  const MedicalRecord = sequelize.define(
    'MedicalRecord',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      patientId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: { model: 'patients', key: 'id' },
      },
      doctorId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'doctors', key: 'id' },
      },
      appointmentId: {
        type: DataTypes.STRING,
        allowNull: true,
        references: { model: 'appointments', key: 'id' },
      },
      visitDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      toothNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      complaints: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      objectiveStatus: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      diagnosis: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      treatmentDone: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      anesthesia: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      recommendations: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      attachments: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      clinicId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'clinics', key: 'id' },
      },
    },
    {
      tableName: 'medical_records',
      timestamps: true,
    }
  );

  MedicalRecord.associate = (models) => {
    MedicalRecord.belongsTo(models.Patient, { foreignKey: 'patientId', as: 'patient' });
    MedicalRecord.belongsTo(models.Doctor, { foreignKey: 'doctorId', as: 'doctor' });
    MedicalRecord.belongsTo(models.Appointment, { foreignKey: 'appointmentId', as: 'appointment' });
    MedicalRecord.belongsTo(models.Clinic, { foreignKey: 'clinicId', as: 'clinic' });
  };

  return MedicalRecord;
};
