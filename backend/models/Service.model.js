module.exports = (sequelize, DataTypes) => {
  const Service = sequelize.define(
    'Service',
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
      category: {
        type: DataTypes.ENUM(
          'therapy',
          'surgery',
          'orthopedics',
          'orthodontics',
          'periodontics',
          'hygiene',
          'diagnostics',
          'other'
        ),
        defaultValue: 'therapy',
      },
      code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      price: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
      },
      duration: {
        type: DataTypes.INTEGER,
        defaultValue: 30,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      clinicId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'clinics', key: 'id' },
      },
    },
    {
      tableName: 'services',
      timestamps: true,
    }
  );

  Service.associate = (models) => {
    Service.belongsTo(models.Clinic, { foreignKey: 'clinicId', as: 'clinic' });
  };

  return Service;
};
