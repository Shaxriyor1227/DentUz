'use strict';

const { DataTypes } = require('sequelize');

/**
 * Odontogram — stores per-patient tooth state map.
 * `teeth` is a JSON object keyed by tooth number (1-32 / UNS notation)
 * Value shape per tooth:
 *   { condition: 'healthy'|'treated'|'caries'|'missing'|'implant'|'crown', notes: string }
 */
module.exports = (sequelize) => {
  const Odontogram = sequelize.define(
    'Odontogram',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      patientId: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        references: { model: 'patients', key: 'id' },
      },
      teeth: {
        type: DataTypes.JSONB,
        defaultValue: {},
        comment: 'Map of tooth_number -> { condition, notes }',
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
    Odontogram.hasMany(models.OdontogramHistory, {
      foreignKey: 'odontogramId',
      as: 'history',
    });
  };

  return Odontogram;
};
