'use strict';

const { DataTypes } = require('sequelize');

/**
 * OdontogramHistory — immutable snapshot appended each time the odontogram
 * is saved.  Enables full audit trail of dental status changes over time.
 */
module.exports = (sequelize) => {
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
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      snapshot: {
        type: DataTypes.JSONB,
        allowNull: false,
        comment: 'Full teeth state at the time of save',
      },
      changedTooth: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Which tooth number changed in this snapshot',
      },
      previousCondition: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      newCondition: {
        type: DataTypes.STRING(30),
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
      updatedAt: false, // history is append-only; no updates
    }
  );

  OdontogramHistory.associate = (models) => {
    OdontogramHistory.belongsTo(models.Odontogram, {
      foreignKey: 'odontogramId',
      as: 'odontogram',
    });
    OdontogramHistory.belongsTo(models.User, { foreignKey: 'savedBy', as: 'author' });
  };

  return OdontogramHistory;
};
