module.exports = (sequelize, DataTypes) => {
  const Clinic = sequelize.define(
    'Clinic',
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
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      workingHours: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      subscriptionPlan: {
        type: DataTypes.ENUM('free', 'starter', 'pro', 'enterprise'),
        defaultValue: 'starter',
      },
      status: {
        type: DataTypes.ENUM('active', 'trial', 'suspended', 'cancelled'),
        defaultValue: 'active',
      },
      subscriptionExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      chairsCount: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      ownerName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: 'clinics',
    }
  );

  Clinic.associate = (models) => {
    Clinic.hasMany(models.User, { foreignKey: 'clinicId', as: 'users' });
    Clinic.hasMany(models.Doctor, { foreignKey: 'clinicId', as: 'doctors' });
    Clinic.hasMany(models.Patient, { foreignKey: 'clinicId', as: 'patients' });
    Clinic.hasMany(models.Appointment, { foreignKey: 'clinicId', as: 'appointments' });
    Clinic.hasMany(models.Invoice, { foreignKey: 'clinicId', as: 'invoices' });
  };

  return Clinic;
};
