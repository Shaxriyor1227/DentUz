module.exports = (sequelize, DataTypes) => {
  const ClinicApplication = sequelize.define(
    'ClinicApplication',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      clinicName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      chairsCount: {
        type: DataTypes.STRING,
        defaultValue: '1-3',
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('new', 'contacted', 'approved', 'rejected'),
        defaultValue: 'new',
      },
    },
    {
      tableName: 'clinic_applications',
      timestamps: true,
    }
  );

  return ClinicApplication;
};
