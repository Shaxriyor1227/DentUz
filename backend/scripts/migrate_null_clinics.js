/**
 * Data Migration Script: Resolving clinicId IS NULL records
 *
 * Usage:
 *   node scripts/migrate_null_clinics.js           (Dry-Run by default)
 *   node scripts/migrate_null_clinics.js --execute (Applies changes)
 */
const db = require('../models');

async function migrateNullClinics() {
  const isExecute = process.argv.includes('--execute');
  console.log(`=== MIGRATION REJIMI: ${isExecute ? 'AMALGA OSHIRISH (--execute)' : 'DRY-RUN (Faqat tahlil, bazaga yozilmaydi)'} ===\n`);

  await db.sequelize.authenticate();

  const resolvable = [];
  const unresolvable = [];

  // 1. PAYMENTS with clinicId IS NULL -> Check via invoiceId
  const nullPayments = await db.Payment.findAll({ where: { clinicId: null } });
  for (const pay of nullPayments) {
    if (pay.invoiceId) {
      const inv = await db.Invoice.findByPk(pay.invoiceId);
      if (inv && inv.clinicId) {
        resolvable.push({
          model: 'Payment',
          id: pay.id,
          reference: `invoiceId: ${pay.invoiceId}`,
          targetClinicId: inv.clinicId,
          reason: `Invoice (${inv.id}) orqali klinika aniqlandi`
        });
        if (isExecute) {
          pay.clinicId = inv.clinicId;
          await pay.save();
        }
        continue;
      }
    }
    unresolvable.push({
      model: 'Payment',
      id: pay.id,
      details: `invoiceId: ${pay.invoiceId}, amount: ${pay.amount}`,
      reason: 'Bog\'langan Invoice topilmadi yoki Invoicening ham clinicId si NULL'
    });
  }

  // 2. APPOINTMENTS with clinicId IS NULL -> Check via doctorId or patientId
  const nullAppointments = await db.Appointment.findAll({ where: { clinicId: null } });
  for (const apt of nullAppointments) {
    let targetClinic = null;
    let reason = '';

    if (apt.doctorId) {
      const doc = await db.Doctor.findByPk(apt.doctorId);
      if (doc && doc.clinicId) {
        targetClinic = doc.clinicId;
        reason = `Doctor (${doc.id}) orqali klinika aniqlandi`;
      }
    }

    if (!targetClinic && apt.patientId) {
      const pat = await db.Patient.findByPk(apt.patientId);
      if (pat && pat.clinicId) {
        targetClinic = pat.clinicId;
        reason = `Patient (${pat.id}) orqali klinika aniqlandi`;
      }
    }

    if (targetClinic) {
      resolvable.push({
        model: 'Appointment',
        id: apt.id,
        reference: `patient: ${apt.patientId}, doctor: ${apt.doctorId}`,
        targetClinicId: targetClinic,
        reason
      });
      if (isExecute) {
        apt.clinicId = targetClinic;
        await apt.save();
      }
    } else {
      unresolvable.push({
        model: 'Appointment',
        id: apt.id,
        details: `patient: ${apt.patientId}, doctor: ${apt.doctorId}, date: ${apt.date}`,
        reason: 'Bog\'langan Shifokor va Bemorning ikkalasida ham clinicId mavjud emas'
      });
    }
  }

  // 3. PATIENTS with clinicId IS NULL -> Check via existing appointments/invoices
  const nullPatients = await db.Patient.findAll({ where: { clinicId: null } });
  for (const pat of nullPatients) {
    // Check if patient has any appointment with a valid clinicId
    const aptWithClinic = await db.Appointment.findOne({
      where: { patientId: pat.id, clinicId: { [db.Sequelize.Op.ne]: null } }
    });
    const invWithClinic = await db.Invoice.findOne({
      where: { patientId: pat.id, clinicId: { [db.Sequelize.Op.ne]: null } }
    });

    const targetClinic = (aptWithClinic && aptWithClinic.clinicId) || (invWithClinic && invWithClinic.clinicId);
    if (targetClinic) {
      resolvable.push({
        model: 'Patient',
        id: pat.id,
        reference: `name: ${pat.name}`,
        targetClinicId: targetClinic,
        reason: 'Bemorning boshqa uchrashuv/fakturasi orqali aniqlandi'
      });
      if (isExecute) {
        pat.clinicId = targetClinic;
        await pat.save();
      }
    } else {
      unresolvable.push({
        model: 'Patient',
        id: pat.id,
        details: `name: ${pat.name}, phone: ${pat.phone}`,
        reason: 'Bemorga bog\'langan hech qanday klinika/faktura/uchrashuv mavjud emas (Mustaqil qator)'
      });
    }
  }

  // 4. USERS with clinicId IS NULL (excluding superadmin)
  const nullUsers = await db.User.findAll({ where: { clinicId: null } });
  for (const u of nullUsers) {
    if (u.role === 'superadmin') {
      // Superadmin purposefully has no clinicId
      continue;
    }
    // Check if user is linked to Doctor profile
    const docProfile = await db.Doctor.findOne({ where: { userId: u.id } });
    if (docProfile && docProfile.clinicId) {
      resolvable.push({
        model: 'User',
        id: u.id,
        reference: `email: ${u.email}`,
        targetClinicId: docProfile.clinicId,
        reason: `Doctor profilidagi (${docProfile.clinicId}) orqali aniqlandi`
      });
      if (isExecute) {
        u.clinicId = docProfile.clinicId;
        await u.save();
      }
    } else {
      unresolvable.push({
        model: 'User',
        id: u.id,
        details: `name: ${u.name}, email: ${u.email}, role: ${u.role}`,
        reason: 'Xodimga biriktirilgan klinika yoki shifokor profili topilmadi'
      });
    }
  }

  console.log('--- 1. BOG\'LAB BO\'LADIGAN QATORLAR (RESOLVABLE) ---');
  if (resolvable.length === 0) {
    console.log('Hech qanday avtomatik bog\'lanuvchi qator topilmadi.\n');
  } else {
    console.table(resolvable);
  }

  console.log('\n--- 2. BOG\'LAB BO\'LMAYDIGAN QATORLAR (UNRESOLVABLE - Qo\'lda tekshirish kerak) ---');
  if (unresolvable.length === 0) {
    console.log('Bog\'lab bo\'lmaydigan qatorlar yo\'q.\n');
  } else {
    console.table(unresolvable);
  }

  console.log(`\nXulosa: ${resolvable.length} ta qator bog'lanishi mumkin, ${unresolvable.length} ta qator qo'lda hal qilinishi lozim.`);
  if (!isExecute && resolvable.length > 0) {
    console.log('Ushbu o\'zgarishlarni qo\'llash uchun: node scripts/migrate_null_clinics.js --execute');
  }

  process.exit(0);
}

migrateNullClinics().catch((err) => {
  console.error(err);
  process.exit(1);
});
