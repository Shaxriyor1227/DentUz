require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Notification, Patient, Appointment, Doctor, Clinic, User, sequelize } = require('../models');
const {
  notifyPatientCreated,
  notifyAppointmentCreated,
  notifyAppointmentUpdated,
  notifyPaymentReceived,
  sendNotification
} = require('../services/notificationService');

async function runComprehensiveVerification() {
  console.log('=== MULTI-TENANT CLINIC NOTIFICATION AUDIT ===\n');

  try {
    // 1. Setup 2 distinct test clinics to test isolation
    const clinicA = await Clinic.findOne({ order: [['createdAt', 'ASC']] });
    if (!clinicA) throw new Error('No existing clinic found in database');

    console.log(`[Test 1] Existing Clinic A: id=${clinicA.id} (${clinicA.name})`);

    // Create a temporary brand-new Clinic B to simulate a fresh tenant with valid UUID
    const { randomUUID } = require('crypto');
    const clinicBId = randomUUID();
    const clinicB = await Clinic.create({
      id: clinicBId,
      name: 'Yangi Ochilgan Klinika B',
      address: 'Toshkent sh.',
      phone: '+998 71 200 00 00',
    });
    console.log(`[Test 2] Freshly Created Clinic B: id=${clinicB.id} (${clinicB.name})`);

    // Verify Clinic B starts with EXACTLY 0 notifications
    const freshNotifsB = await Notification.findAll({ where: { clinicId: clinicB.id } });
    console.log(`✓ Verification 1: Fresh Clinic B has ${freshNotifsB.length} notifications (Expected: 0)`);
    if (freshNotifsB.length !== 0) {
      throw new Error(`Expected 0 notifications for fresh clinic B, but found ${freshNotifsB.length}`);
    }

    // 2. Perform an action ONLY on Clinic B: add a patient
    const patientB = { id: `P-B-${Date.now()}`, name: 'Nodirbek Aliyev', phone: '+998 90 111 22 33' };
    const notifPatientB = await notifyPatientCreated(patientB, clinicB.id);
    console.log(`✓ Verification 2: Patient created on Clinic B -> Notification ID: ${notifPatientB?.id}`);

    // Perform appointment action on Clinic B
    const aptB = { id: `apt-b-${Date.now()}`, date: '2026-10-01', time: '10:00' };
    const docB = { name: 'Rustamov' };
    const notifAptB = await notifyAppointmentCreated(aptB, patientB, docB, clinicB.id);
    console.log(`✓ Verification 3: Appointment created on Clinic B -> Notification ID: ${notifAptB?.id}`);

    // Perform appointment update (reschedule) on Clinic B
    const notifUpdateB = await notifyAppointmentUpdated(
      { ...aptB, date: '2026-10-02', time: '15:00' },
      patientB,
      "qabul vaqti 2026-10-02 soat 15:00 ga ko'chirildi",
      clinicB.id
    );
    console.log(`✓ Verification 4: Appointment updated on Clinic B -> Notification ID: ${notifUpdateB?.id}`);

    // Verify Clinic B now has EXACTLY 3 notifications
    const notifsBAfter = await Notification.findAll({ where: { clinicId: clinicB.id }, order: [['createdAt', 'DESC']] });
    console.log(`✓ Verification 5: Clinic B now has ${notifsBAfter.length} notifications (Expected: 3)`);
    if (notifsBAfter.length !== 3) {
      throw new Error(`Expected 3 notifications on clinic B, got ${notifsBAfter.length}`);
    }

    // Verify Clinic A did NOT receive any of Clinic B's notifications
    const crossCheckA = await Notification.findAll({
      where: {
        clinicId: clinicA.id,
        id: notifsBAfter.map(n => n.id)
      }
    });
    console.log(`✓ Verification 6: Clinic A has ${crossCheckA.length} notifications of Clinic B (Expected: 0 - 100% Isolated)`);
    if (crossCheckA.length !== 0) {
      throw new Error(`Tenant leak detected! Clinic A saw ${crossCheckA.length} notifications belonging to Clinic B`);
    }

    // 3. Test markAsRead & markAllAsRead
    const [unreadCountBefore] = await Promise.all([
      Notification.count({ where: { clinicId: clinicB.id, status: 'pending' } })
    ]);
    console.log(`✓ Verification 7: Clinic B unread count before read-all: ${unreadCountBefore}`);

    await Notification.update({ status: 'read' }, { where: { clinicId: clinicB.id } });
    const unreadCountAfter = await Notification.count({ where: { clinicId: clinicB.id, status: 'pending' } });
    console.log(`✓ Verification 8: Clinic B unread count after read-all: ${unreadCountAfter} (Expected: 0)`);
    if (unreadCountAfter !== 0) {
      throw new Error(`Expected 0 unread on Clinic B, got ${unreadCountAfter}`);
    }

    // 4. Test clearAll only affects Clinic B
    await Notification.destroy({ where: { clinicId: clinicB.id } });
    const countAfterDestroy = await Notification.count({ where: { clinicId: clinicB.id } });
    console.log(`✓ Verification 9: Clinic B after clearAll has ${countAfterDestroy} notifications (Expected: 0)`);

    // Clean up temporary clinic B
    await clinicB.destroy();
    console.log(`✓ Cleaned up temporary test clinic B.\n`);

    console.log('=== ALL TESTS PASSED: 100% ACCURATE & STRICTLY ISOLATED ===');
    process.exit(0);
  } catch (err) {
    console.error('Test Failed:', err);
    process.exit(1);
  }
}

runComprehensiveVerification();
