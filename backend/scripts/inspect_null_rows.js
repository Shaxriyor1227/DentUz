const db = require('../models');

async function inspectNullRows() {
  await db.sequelize.authenticate();

  console.log('=== USERS with clinicId IS NULL ===');
  const users = await db.User.findAll({
    where: { clinicId: null },
    attributes: ['id', 'name', 'email', 'role']
  });
  console.table(users.map(u => u.toJSON()));

  console.log('\n=== PATIENTS with clinicId IS NULL ===');
  const patients = await db.Patient.findAll({
    where: { clinicId: null },
    attributes: ['id', 'name', 'phone', 'createdAt']
  });
  console.table(patients.map(p => p.toJSON()));

  console.log('\n=== APPOINTMENTS with clinicId IS NULL ===');
  const appointments = await db.Appointment.findAll({
    where: { clinicId: null },
    attributes: ['id', 'patientId', 'doctorId', 'date', 'time']
  });
  console.table(appointments.map(a => a.toJSON()));

  console.log('\n=== PAYMENTS with clinicId IS NULL ===');
  const payments = await db.Payment.findAll({
    where: { clinicId: null },
    attributes: ['id', 'invoiceId', 'amount', 'method']
  });
  console.table(payments.map(p => p.toJSON()));

  process.exit(0);
}

inspectNullRows().catch(console.error);
