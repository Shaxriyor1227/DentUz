module.exports = (sequelize, DataTypes) => {
  const Inventory = sequelize.define(
    'Inventory',
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
          'consumable',
          'implant',
          'ortho',
          'instrument',
          'medication',
          'hygiene',
          'other'
        ),
        defaultValue: 'consumable',
      },
      sku: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      quantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      unit: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'dona',
      },
      minQuantity: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 5,
      },
      costPrice: {
        type: DataTypes.BIGINT,
        defaultValue: 0,
      },
      supplier: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      expiryDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      batchNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      clinicId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'clinics', key: 'id' },
      },
    },
    {
      tableName: 'inventory',
      timestamps: true,
    }
  );

  Inventory.associate = (models) => {
    Inventory.belongsTo(models.Clinic, { foreignKey: 'clinicId', as: 'clinic' });
  };

  return Inventory;
};
