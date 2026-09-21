const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
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
      shortName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
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
      },
      clinicId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'clinics', key: 'id' },
      },
      phone: {
        type: DataTypes.STRING,
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
        withSecrets: { attributes: {} },
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
