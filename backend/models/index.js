const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Clinic = require('./Clinic.model')(sequelize, DataTypes);
const User = require('./User.model')(sequelize, DataTypes);
const Doctor = require('./Doctor.model')(sequelize, DataTypes);
const Patient = require('./Patient.model')(sequelize, DataTypes);
const Appointment = require('./Appointment.model')(sequelize, DataTypes);
const Invoice = require('./Invoice.model')(sequelize, DataTypes);
const Odontogram = require('./Odontogram.model')(sequelize, DataTypes);
const OdontogramHistory = require('./OdontogramHistory.model')(sequelize, DataTypes);
const Notification = require('./Notification.model')(sequelize, DataTypes);
const Service = require('./Service.model')(sequelize, DataTypes);
const TreatmentPlan = require('./TreatmentPlan.model')(sequelize, DataTypes);
const Payment = require('./Payment.model')(sequelize, DataTypes);
const MedicalRecord = require('./MedicalRecord.model')(sequelize, DataTypes);
const LabOrder = require('./LabOrder.model')(sequelize, DataTypes);
const Inventory = require('./Inventory.model')(sequelize, DataTypes);

const models = {
  Clinic,
  User,
  Doctor,
  Patient,
  Appointment,
  Invoice,
  Odontogram,
  OdontogramHistory,
  Notification,
  Service,
  TreatmentPlan,
  Payment,
  MedicalRecord,
  LabOrder,
  Inventory,
};

Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = { sequelize, Sequelize, ...models };
