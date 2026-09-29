const { Notification } = require('../models');

/**
 * Safe notification creation helper.
 * Does not throw or interrupt main business flow on notification failure.
 */
async function sendNotification({
  clinicId,
  recipientId = null,
  channel = 'in_app',
  type,
  title,
  body,
  status = 'pending',
  metadata = {}
}) {
  try {
    if (!clinicId && !recipientId) {
      console.warn('[NotificationService] Missing clinicId or recipientId, skipping notification');
      return null;
    }

    const notification = await Notification.create({
      clinicId,
      recipientId: recipientId ? String(recipientId) : null,
      channel,
      type: type || 'system',
      title: title || 'Bildirishnoma',
      body: body || '',
      status: status || 'pending',
      sentAt: new Date(),
      metadata: metadata || {}
    });

    return notification;
  } catch (err) {
    console.error('[NotificationService] Failed to create notification:', err.message);
    return null;
  }
}

/**
 * Event: Yangi bemor ro'yxatga olindi
 */
async function notifyPatientCreated(patient, clinicId) {
  if (!patient || !clinicId) return null;
  return sendNotification({
    clinicId,
    type: 'patient',
    title: "Yangi bemor ro'yxatga olindi",
    body: `${patient.name} (${patient.phone || 'Tel ko\'rsatilmadi'}) tizimga muvaffaqiyatli kiritildi`,
    metadata: {
      patientId: patient.id,
      patientName: patient.name,
      link: `/patients/${patient.id}`,
      icon: 'person_add',
      color: '#8B5CF6'
    }
  });
}

/**
 * Event: Yangi qabul yozildi
 */
async function notifyAppointmentCreated(appointment, patient, doctor, clinicId) {
  if (!appointment || !clinicId) return null;
  const pName = patient?.name || appointment.patientName || 'Bemor';
  const dName = doctor?.name ? `Dr. ${doctor.name}` : 'shifokor';
  const dateStr = appointment.date || 'bugun';
  const timeStr = appointment.time ? `soat ${appointment.time} da` : '';

  return sendNotification({
    clinicId,
    type: 'appointment',
    title: 'Yangi qabul belgilandi',
    body: `${pName} — ${dateStr} ${timeStr} ${dName} qabuliga yozildi`,
    metadata: {
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      link: '/calendar',
      icon: 'calendar_today',
      color: '#06B6D4'
    }
  });
}

/**
 * Event: Qabul holati o'zgardi (masalan bekor qilindi yoki ko'chirildi)
 */
async function notifyAppointmentUpdated(appointment, patient, statusText, clinicId) {
  if (!appointment || !clinicId) return null;
  const pName = patient?.name || appointment.patientName || 'Bemor';

  return sendNotification({
    clinicId,
    type: 'appointment',
    title: "Qabul yangilandi",
    body: `${pName} qabuli: ${statusText || appointment.status}`,
    metadata: {
      appointmentId: appointment.id,
      link: '/calendar',
      icon: 'schedule',
      color: '#F59E0B'
    }
  });
}

/**
 * Event: To'lov qabul qilindi
 */
async function notifyPaymentReceived(payment, patient, clinicId) {
  if (!payment || !clinicId) return null;
  const pName = patient?.name || 'Bemor';
  const amountFormatted = Number(payment.amount || 0).toLocaleString('uz-UZ');
  const methodStr = payment.method ? `(${payment.method})` : '';

  return sendNotification({
    clinicId,
    type: 'payment',
    title: "To'lov qabul qilindi",
    body: `${pName}: ${amountFormatted} so'm qabul qilindi ${methodStr}`.trim(),
    metadata: {
      paymentId: payment.id,
      invoiceId: payment.invoiceId,
      patientId: payment.patientId,
      link: '/finance',
      icon: 'payments',
      color: '#10B981'
    }
  });
}

/**
 * Event: Dori-darmon / ashyo qoldig'i kamayib ketdi
 */
async function notifyLowStock(item, clinicId) {
  if (!item || !clinicId) return null;
  return sendNotification({
    clinicId,
    type: 'inventory',
    title: 'Omborda qoldiq oz qoldi',
    body: `"${item.name}" qoldig'i kritik darajada: ${item.quantity} ${item.unit || 'dona'} (minimal me'yor: ${item.minQuantity})`,
    metadata: {
      itemId: item.id,
      link: '/settings',
      icon: 'inventory_2',
      color: '#EF4444'
    }
  });
}

/**
 * Event: Laboratoriya buyurtmasi tayyor bo'ldi
 */
async function notifyLabOrderReady(order, patient, clinicId) {
  if (!order || !clinicId) return null;
  const pName = patient?.name || 'Bemor';
  return sendNotification({
    clinicId,
    type: 'lab_order',
    title: 'Laboratoriya buyurtmasi tayyor',
    body: `${pName}: "${order.constructionType || 'Konstruksiya'}" laboratoriya buyurtmasi yetib keldi`,
    metadata: {
      orderId: order.id,
      link: '/treatment-plan',
      icon: 'biotech',
      color: '#3B82F6'
    }
  });
}

module.exports = {
  sendNotification,
  notifyPatientCreated,
  notifyAppointmentCreated,
  notifyAppointmentUpdated,
  notifyPaymentReceived,
  notifyLowStock,
  notifyLabOrderReady
};
