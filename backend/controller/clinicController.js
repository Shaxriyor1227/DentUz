const { Clinic, User, Doctor, Patient, Appointment, Invoice, ClinicApplication } = require('../models');
const { validateClinic } = require('../validations/clinicValidation');
const { sendTelegramMessage } = require('../utils/telegram');

function escapeHtml(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

exports.getClinics = async (req, res) => {
  try {
    // Only superadmin can list all clinics
    if (req.user?.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: "Ruxsat yo'q: Barcha klinikalarni ko'rish faqat superadmin uchun ruxsat etilgan" });
    }
    const clinics = await Clinic.findAll();
    res.status(200).json({ success: true, data: clinics });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getClinicById = async (req, res) => {
  try {
    const isSuperAdmin = req.user?.role === 'superadmin' || req.isSuperAdmin;
    const requestedId = req.params.id;

    // Tenant check: Non-superadmin users can ONLY view their own clinic
    if (!isSuperAdmin && requestedId !== req.clinicId && requestedId !== req.user?.clinicId) {
      return res.status(403).json({
        success: false,
        message: "Ruxsat yo'q: Boshqa klinika profiliga kirish taqiqlanadi",
      });
    }

    const clinic = await Clinic.findByPk(requestedId, {
      include: [
        { model: User, as: 'users', attributes: ['id', 'name', 'role', 'email'] },
        { model: Doctor, as: 'doctors', attributes: ['id', 'userId', 'specialization', 'cabinetNumber'] },
      ],
    });
    if (!clinic) return res.status(404).json({ success: false, message: 'Klinika topilmadi' });
    res.status(200).json({ success: true, data: clinic });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createClinic = async (req, res) => {
  // Only superadmin can create a clinic via this route
  if (req.user?.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: "Ruxsat yo'q: Yangi klinika ochish faqat platforma superadmini uchun ruxsat etilgan" });
  }

  const { error } = validateClinic(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const clinic = await Clinic.create(req.body);
    res.status(201).json({ success: true, data: clinic });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateClinic = async (req, res) => {
  const isSuperAdmin = req.user?.role === 'superadmin' || req.isSuperAdmin;
  const requestedId = req.params.id;

  // Tenant check: Users can only update their own clinic
  if (!isSuperAdmin && requestedId !== req.clinicId && requestedId !== req.user?.clinicId) {
    return res.status(403).json({
      success: false,
      message: "Ruxsat yo'q: Boshqa klinika ma'lumotlarini o'zgartirish taqiqlanadi",
    });
  }

  const { error } = validateClinic(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const clinic = await Clinic.findByPk(requestedId);
    if (!clinic) return res.status(404).json({ success: false, message: 'Klinika topilmadi' });

    await clinic.update(req.body);
    res.status(200).json({ success: true, data: clinic });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteClinic = async (req, res) => {
  // Only superadmin can delete a clinic
  if (req.user?.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: "Ruxsat yo'q: Klinikani o'chirish faqat superadmin uchun ruxsat etilgan" });
  }

  try {
    const clinic = await Clinic.findByPk(req.params.id);
    if (!clinic) return res.status(404).json({ success: false, message: 'Klinika topilmadi' });

    const data = clinic.toJSON();
    await clinic.destroy();
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getClinicStats = async (req, res) => {
  try {
    const isSuperAdmin = req.user?.role === 'superadmin' || req.isSuperAdmin;
    const { id: clinicId } = req.params;

    if (!isSuperAdmin && clinicId !== req.clinicId && clinicId !== req.user?.clinicId) {
      return res.status(403).json({
        success: false,
        message: "Ruxsat yo'q: Boshqa klinika statistikasiga kirish taqiqlanadi",
      });
    }

    const [usersCount, patientsCount, appointmentsCount, invoicesCount] = await Promise.all([
      User.count({ where: { clinicId } }),
      Patient.count({ where: { clinicId } }),
      Appointment.count({ where: { clinicId } }),
      Invoice.count({ where: { clinicId } }),
    ]);

    res.status(200).json({
      success: true,
      data: { clinicId, usersCount, patientsCount, appointmentsCount, invoicesCount },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.submitApplication = async (req, res) => {
  try {
    // 1. Honeypot check: Bots filling hidden fields (website, fax, honeypot) get rejected
    if (req.body.website || req.body.fax || req.body.honeypot) {
      return res.status(400).json({ success: false, message: "Noto'g'ri so'rov" });
    }

    const { name, clinicName, phone, chairsCount = '1-3', message = '' } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Ism va telefon raqami majburiy' });
    }

    // 2. Phone number validation (+998 format)
    const normalizedPhone = String(phone).replace(/\s+/g, '');
    const uzPhoneRegex = /^\+998\d{9}$/;
    if (!uzPhoneRegex.test(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Telefon raqami noto'g'ri formatda. Iltimos, +998901234567 formatida kiriting.",
      });
    }

    // 3. Save to database with sanitized inputs
    const application = await ClinicApplication.create({
      name: name.trim().slice(0, 100),
      clinicName: (clinicName || '').trim().slice(0, 100),
      phone: normalizedPhone,
      chairsCount: String(chairsCount).slice(0, 20),
      message: (message || '').trim().slice(0, 1000),
    });

    const now = new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' });

    // 4. HTML Escape to prevent HTML injection in Telegram
    const safeClinicName = escapeHtml(clinicName || "Ko'rsatilmagan");
    const safeName = escapeHtml(name);
    const safePhone = escapeHtml(normalizedPhone);
    const safeChairs = escapeHtml(chairsCount);
    const safeMessage = escapeHtml(message || "Yo'q");
    const safeTime = escapeHtml(now);

    const telegramText =
`🔔 <b>YANGI KLINIKA MUROJAATI (DentUz)!</b>

🏥 <b>Klinika nomi:</b> ${safeClinicName}
👤 <b>Mas'ul shaxs:</b> ${safeName}
📞 <b>Telefon:</b> <a href="tel:${safePhone}">${safePhone}</a>
🪑 <b>Kreslolar soni:</b> ${safeChairs}
💬 <b>Xabar/Izoh:</b> ${safeMessage}
⏰ <b>Kelgan vaqti:</b> ${safeTime}`;

    sendTelegramMessage(telegramText).catch((err) => {
      console.warn('Telegram notification failed:', err.message);
    });

    res.status(201).json({
      success: true,
      message: "Murojaatingiz muvaffaqiyatli qabul qilindi. Tez orada siz bilan bog'lanamiz!",
      data: application,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getApplications = async (req, res) => {
  // Only superadmin can view onboarding leads and applications
  if (req.user?.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: "Ruxsat yo'q: Barcha arizalarni ko'rish faqat superadmin uchun ruxsat etilgan" });
  }

  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;

    const applications = await ClinicApplication.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  // Only superadmin can update lead application statuses
  if (req.user?.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: "Ruxsat yo'q: Ariza holatini yangilash faqat superadmin uchun ruxsat etilgan" });
  }

  try {
    const { status } = req.body;
    const application = await ClinicApplication.findByPk(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Ariza topilmadi' });
    }

    await application.update({ status });
    res.status(200).json({
      success: true,
      message: 'Ariza holati yangilandi',
      data: application,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
