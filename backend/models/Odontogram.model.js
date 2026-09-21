module.exports = (sequelize, DataTypes) => {
  const Odontogram = sequelize.define(
    'Odontogram',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      patientId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        references: { model: 'patients', key: 'id' },
      },
      teeth: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
      lastUpdatedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
      },
    },
    {
      tableName: 'odontograms',
    }
  );

  Odontogram.associate = (models) => {
    Odontogram.belongsTo(models.Patient, { foreignKey: 'patientId', as: 'patient' });
    Odontogram.belongsTo(models.User, { foreignKey: 'lastUpdatedBy', as: 'updatedBy' });
    Odontogram.hasMany(models.OdontogramHistory, { foreignKey: 'odontogramId', as: 'history' });
  };

  return Odontogram;
};
