'use strict';

const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      shortName: {
        type: DataTypes.STRING(60),
        allowNull: true,
        comment: 'e.g. "Dr. Azimov" — shown in calendar cards',
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'e.g. "Bosh shifokor • Implantolog"',
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('owner', 'doctor', 'receptionist', 'nurse'),
        allowNull: false,
        defaultValue: 'receptionist',
        comment:
          '"admin" in frontend mock maps to "receptionist"; "assistant" is a title-only label under nurse',
      },
      clinicId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'clinics', key: 'id' },
      },
      phone: {
        type: DataTypes.STRING(25),
        allowNull: true,
      },
      avatarUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      refreshToken: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'users',
      defaultScope: {
        attributes: { exclude: ['password', 'refreshToken'] },
      },
      scopes: {
        withSecrets: {
          attributes: {},
        },
      },
    }
  );

  // Hash password before create / update
  const hashPassword = async (user) => {
    if (user.changed('password')) {
      const salt = await bcrypt.genSalt(12);
      user.password = await bcrypt.hash(user.password, salt);
    }
  };
  User.beforeCreate(hashPassword);
  User.beforeUpdate(hashPassword);

  User.prototype.comparePassword = function (plain) {
    return bcrypt.compare(plain, this.password);
  };

  User.associate = (models) => {
    User.belongsTo(models.Clinic, { foreignKey: 'clinicId', as: 'clinic' });
    User.hasOne(models.Doctor, { foreignKey: 'userId', as: 'doctorProfile' });
  };

  return User;
};
