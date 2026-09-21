module.exports = (sequelize, DataTypes) => {
  const OdontogramHistory = sequelize.define(
    'OdontogramHistory',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      odontogramId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'odontograms', key: 'id' },
      },
      patientId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      snapshot: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      changedTooth: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      previousCondition: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      newCondition: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      savedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
      },
    },
    {
      tableName: 'odontogram_history',
      updatedAt: false,
    }
  );

  OdontogramHistory.associate = (models) => {
    OdontogramHistory.belongsTo(models.Odontogram, { foreignKey: 'odontogramId', as: 'odontogram' });
    OdontogramHistory.belongsTo(models.User, { foreignKey: 'savedBy', as: 'author' });
  };

  return OdontogramHistory;
};
