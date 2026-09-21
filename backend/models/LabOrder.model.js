module.exports = (sequelize, DataTypes) => {
  const LabOrder = sequelize.define(
    'LabOrder',
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
      technicianName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      workType: {
        type: DataTypes.ENUM(
          'zirconia_crown',
          'pfm_crown',
          'e_max_veneer',
          'implant_abutment',
          'removable_denture',
          'clasp_denture',
          'aligners',
          'other'
        ),
        defaultValue: 'zirconia_crown',
      },
      toothNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      shade: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sentDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      cost: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.ENUM('sent', 'in_progress', 'ready', 'fitted', 'redo', 'cancelled'),
        defaultValue: 'sent',
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
      tableName: 'lab_orders',
      timestamps: true,
    }
  );

  LabOrder.associate = (models) => {
    LabOrder.belongsTo(models.Patient, { foreignKey: 'patientId', as: 'patient' });
    LabOrder.belongsTo(models.Doctor, { foreignKey: 'doctorId', as: 'doctor' });
    LabOrder.belongsTo(models.Clinic, { foreignKey: 'clinicId', as: 'clinic' });
  };

  return LabOrder;
};
