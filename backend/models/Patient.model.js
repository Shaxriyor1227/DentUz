module.exports = (sequelize, DataTypes) => {
  const Patient = sequelize.define(
    'Patient',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      birthdate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      age: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      lastVisit: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      lastProcedure: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      nextVisit: {
        type: DataTypes.STRING,
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
    Patient.hasMany(models.TreatmentPlan, { foreignKey: 'patientId', as: 'treatmentPlans' });
    Patient.hasMany(models.MedicalRecord, { foreignKey: 'patientId', as: 'medicalRecords' });
    Patient.hasMany(models.LabOrder, { foreignKey: 'patientId', as: 'labOrders' });
    Patient.hasMany(models.Payment, { foreignKey: 'patientId', as: 'payments' });
  };

  return Patient;
};
