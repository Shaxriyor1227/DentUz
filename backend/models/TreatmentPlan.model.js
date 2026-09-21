module.exports = (sequelize, DataTypes) => {
  const TreatmentPlan = sequelize.define(
    'TreatmentPlan',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Davolash rejasi',
      },
      patientId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: { model: 'patients', key: 'id' },
      },
      doctorId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'doctors', key: 'id' },
      },
      status: {
        type: DataTypes.ENUM('draft', 'proposed', 'in_progress', 'completed', 'cancelled'),
        defaultValue: 'draft',
      },
      totalAmount: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
      },
      discountAmount: {
        type: DataTypes.BIGINT,
        defaultValue: 0,
      },
      finalAmount: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
      },
      paidAmount: {
        type: DataTypes.BIGINT,
        defaultValue: 0,
      },
      items: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      clinicId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'clinics', key: 'id' },
      },
    },
    {
      tableName: 'treatment_plans',
      timestamps: true,
    }
  );

  TreatmentPlan.associate = (models) => {
    TreatmentPlan.belongsTo(models.Patient, { foreignKey: 'patientId', as: 'patient' });
    TreatmentPlan.belongsTo(models.Doctor, { foreignKey: 'doctorId', as: 'doctor' });
    TreatmentPlan.belongsTo(models.Clinic, { foreignKey: 'clinicId', as: 'clinic' });
  };

  return TreatmentPlan;
};
