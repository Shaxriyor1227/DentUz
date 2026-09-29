const { Clinic, User, Doctor, Patient, Appointment, ClinicApplication, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

/**
 * SuperAdmin platforma statistikasi
 */
exports.getStats = async (req, res) => {
  try {
    const [
      totalClinics,
      activeClinics,
      totalApplications,
      newApplications,
      totalDoctors,
      totalPatients,
    ] = await Promise.all([
      Clinic.count(),
      Clinic.count({ where: { status: 'active' } }),
      ClinicApplication.count(),
      ClinicApplication.count({ where: { status: 'new' } }),
      Doctor.count(),
      Patient.count(),
    ]);

    // Taxminiy oylik tushum (MRR hisobi)
    const clinics = await Clinic.findAll({ attributes: ['subscriptionPlan', 'status'] });
    const planPrices = { starter: 350000, pro: 750000, enterprise: 1500000, free: 0 };
    const estimatedMRR = clinics.reduce((sum, c) => {
      if (c.status === 'active') {
        return sum + (planPrices[c.subscriptionPlan] || 0);
      }
      return sum;
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        totalClinics,
        activeClinics,
        totalApplications,
        newApplications,
        totalDoctors,
        totalPatients,
        estimatedMRR,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Tushgan barcha arizalar (Inquiries / Leads)
 */
exports.getApplications = async (req, res) => {
  try {
    const { status, search } = req.query;
    const where = {};
    if (status) where.status = status;

    let applications = await ClinicApplication.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      applications = applications.filter(
        (a) =>
          (a.name && a.name.toLowerCase().includes(q)) ||
          (a.clinicName && a.clinicName.toLowerCase().includes(q)) ||
          (a.phone && a.phone.includes(q))
      );
    }

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Ariza holatini yangilash (new, contacted, approved, rejected)
 */
exports.updateApplicationStatus = async (req, res) => {
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

/**
 * Arizani o'chirish
 */
exports.deleteApplication = async (req, res) => {
  try {
    const application = await ClinicApplication.findByPk(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Ariza topilmadi' });
    }

    await application.destroy();
    res.status(200).json({
      success: true,
      message: 'Ariza tizimdan o\'chirildi',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Barcha ro'yxatdan o'tgan klinikalar va ularning holati
 */
exports.getClinics = async (req, res) => {
  try {
    const clinics = await Clinic.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['id', 'name', 'email', 'role', 'phone'],
        },
      ],
    });

    // Har bir klinika uchun shifokorlar, barcha xodimlar va bemorlar sonini qo'shib berish
    const enrichedClinics = await Promise.all(
      clinics.map(async (c) => {
        const [doctorsCount, staffCount, patientsCount] = await Promise.all([
          Doctor.count({ where: { clinicId: c.id } }),
          User.count({ where: { clinicId: c.id } }),
          Patient.count({ where: { clinicId: c.id } }),
        ]);

        const owner = c.users && c.users.find((u) => u.role === 'owner');

        return {
          ...c.toJSON(),
          owner: owner || null,
          doctorsCount,
          staffCount,
          patientsCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enrichedClinics.length,
      data: enrichedClinics,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Onboard Clinic: Arizani tasdiqlab, 1 bosishda yangi Klinika va unga Owner (Admin) yaratish
 */
exports.onboardClinic = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      applicationId,
      name,
      ownerName,
      email,
      phone,
      chairsCount = 1,
      subscriptionPlan = 'pro',
      address = '',
      password,
    } = req.body;

    if (!name || !ownerName || !email || !phone) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Klinika nomi, egasining ismi, email va telefon majburiy!',
      });
    }

    // Email band emasligini tekshirish
    const existingUser = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    if (existingUser) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Ushbu email (${email}) allaqachon boshqa foydalanuvchiga biriktirilgan.`,
      });
    }

    // Parol tayyorlash (agar kiritilmagan bo'lsa, xavfsiz avtomatik parol beriladi)
    const plainPassword = password && password.trim() ? password.trim() : `DentUz${Math.floor(1000 + Math.random() * 9000)}!`;
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Litsenziya muddatini hisoblash (odatiy holatda 1 oy yoki 1 yil)
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 oylik faol litsenziya

    // 1. Klinikani yaratish
    const clinic = await Clinic.create(
      {
        name: name.trim(),
        address: address ? address.trim() : 'Toshkent shahri',
        phone: phone.trim(),
        workingHours: '09:00 - 19:00',
        subscriptionPlan,
        status: 'active',
        subscriptionExpiresAt: expiresAt,
        chairsCount: parseInt(chairsCount, 10) || 1,
        ownerName: ownerName.trim(),
        email: email.trim().toLowerCase(),
      },
      { transaction }
    );

    // 2. Klinika egasini (Owner akkaunti) yaratish
    const owner = await User.create(
      {
        name: ownerName.trim(),
        shortName: `Dr. ${ownerName.trim().split(' ')[0]}`,
        title: 'Klinika Rahbari • Bosh Shifokor',
        email: email.trim().toLowerCase(),
        password: plainPassword,
        role: 'owner',
        phone: phone.trim(),
        clinicId: clinic.id,
      },
      { transaction }
    );

    // 3. Shifokor sifatida ham ro'yxatdan o'tkazish
    await Doctor.create(
      {
        userId: owner.id,
        clinicId: clinic.id,
        specialization: 'Stomatolog-Terapevt',
        cabinetNumber: '1',
      },
      { transaction }
    );

    // 4. Agar ariza orqali yaratilgan bo'lsa, arizani "approved" qilish
    if (applicationId) {
      const app = await ClinicApplication.findByPk(applicationId);
      if (app) {
        await app.update({ status: 'approved' }, { transaction });
      }
    }

    await transaction.commit();

    // 5. Mijozga yuborish uchun tayyor bildirishnoma matni
    const notificationText = 
`Assalomu alaykum, hurmatli ${ownerName}!

DentUz klinika boshqaruv tizimidagi yangi profilingiz muvaffaqiyatli faollashtirildi! 🎉

🏥 Klinika: ${name}
📦 Tarif: ${subscriptionPlan.toUpperCase()}
👤 Login (Email): ${email}
🔑 Parol: ${plainPassword}
🌐 Kirish manzili: http://localhost:3001/login

Tizimga kirgandan so'ng parolingizni yangilashingiz va shifokorlaringizni qo'shishingiz mumkin. Savollaringiz bo'lsa, texnik ko'mak xizmatimiz doim aloqada!`;

    res.status(201).json({
      success: true,
      message: 'Klinika va boshqaruvchi (Owner) akkaunti muvaffaqiyatli yaratildi!',
      data: {
        clinic,
        owner: {
          id: owner.id,
          name: owner.name,
          email: owner.email,
          role: owner.role,
        },
        credentials: {
          email,
          plainPassword,
        },
        notificationText,
      },
    });
  } catch (err) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Klinika holatini o'zgartirish (Faollashtirish / Bloklash)
 */
exports.updateClinicStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const clinic = await Clinic.findByPk(req.params.id);
    if (!clinic) {
      return res.status(404).json({ success: false, message: 'Klinika topilmadi' });
    }

    await clinic.update({ status });
    res.status(200).json({
      success: true,
      message: `Klinika holati muvaffaqiyatli yangilandi: ${status}`,
      data: clinic,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Klinika tarifini yangilash
 */
exports.updateClinicPlan = async (req, res) => {
  try {
    const { subscriptionPlan, additionalMonths = 1 } = req.body;
    const clinic = await Clinic.findByPk(req.params.id);
    if (!clinic) {
      return res.status(404).json({ success: false, message: 'Klinika topilmadi' });
    }

    const currentExpire = clinic.subscriptionExpiresAt ? new Date(clinic.subscriptionExpiresAt) : new Date();
    const baseDate = currentExpire > new Date() ? currentExpire : new Date();
    baseDate.setMonth(baseDate.getMonth() + parseInt(additionalMonths, 10));

    await clinic.update({
      subscriptionPlan: subscriptionPlan || clinic.subscriptionPlan,
      subscriptionExpiresAt: baseDate,
      status: 'active',
    });

    res.status(200).json({
      success: true,
      message: 'Klinika obuna tarifi va muddati muvaffaqiyatli uzaytirildi',
      data: clinic,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Barcha foydalanuvchilar va ularning huquqlarini olish (RBAC / Access Control)
 */
exports.getUsers = async (req, res) => {
  try {
    const { role, clinicId, search } = req.query;
    const where = {};
    if (role && role !== 'all') where.role = role;
    if (clinicId && clinicId !== 'all') where.clinicId = clinicId;

    let users = await User.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [
        { model: Clinic, as: 'clinic', attributes: ['id', 'name'] },
        { model: Doctor, as: 'doctorProfile', attributes: ['id', 'specialization', 'cabinetNumber'] },
      ],
      attributes: ['id', 'name', 'username', 'shortName', 'title', 'email', 'role', 'phone', 'isActive', 'clinicId', 'createdAt'],
    });

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      users = users.filter(
        (u) =>
          (u.name && u.name.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.username && u.username.toLowerCase().includes(q)) ||
          (u.phone && u.phone.includes(q))
      );
    }

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Yangi foydalanuvchi / xodim yaratish
 */
exports.createUser = async (req, res) => {
  try {
    const { name, username, email, password, role = 'receptionist', clinicId, phone, title } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Ism, email va parol majburiy' });
    }

    const existing = await User.findOne({
      where: {
        [sequelize.Sequelize.Op.or]: [
          { email: email.trim().toLowerCase() },
          ...(username ? [{ username: username.trim().toLowerCase() }] : []),
        ],
      },
    });

    if (existing) {
      return res.status(409).json({ success: false, message: 'Bu email yoki login allaqachon mavjud' });
    }

    const user = await User.create({
      name: name.trim(),
      username: username ? username.trim().toLowerCase() : null,
      email: email.trim().toLowerCase(),
      password: password.trim(),
      role,
      clinicId: clinicId || null,
      phone: phone ? phone.trim() : null,
      title: title ? title.trim() : null,
      isActive: true,
    });

    // Agar shifokor roli tanlangan bo'lsa, Doctor profilini ham avtomatik yaratish
    if (role === 'doctor' && clinicId) {
      try {
        await Doctor.create({
          userId: user.id,
          clinicId: clinicId,
          specialization: title ? title.trim() : 'Stomatolog',
          cabinetNumber: 1,
        });
      } catch (docErr) {
        console.warn('Doctor profile creation warning:', docErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Foydalanuvchi muvaffaqiyatli yaratildi',
      data: user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Foydalanuvchi holatini o'zgartirish (Bloklash / Faollashtirish)
 */
exports.updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
    }

    await user.update({ isActive: Boolean(isActive) });
    res.status(200).json({
      success: true,
      message: `Foydalanuvchi holati yangilandi: ${isActive ? 'Faollashtirildi' : 'Bloklandi'}`,
      data: { id: user.id, isActive: user.isActive },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Foydalanuvchi rolini o'zgartirish (Ruxsatlarni boshqarish)
 */
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
    }

    await user.update({ role });
    res.status(200).json({
      success: true,
      message: `Foydalanuvchi roli muvaffaqiyatli yangilandi: ${role}`,
      data: user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Foydalanuvchi parolini yangilash (Parolni tiklash)
 */
exports.updateUserPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.trim().length < 6) {
      return res.status(400).json({ success: false, message: 'Parol kamida 6 belgidan iborat bo\'lishi shart' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
    }

    user.password = password.trim();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Foydalanuvchi paroli muvaffaqiyatli yangilandi',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Foydalanuvchini o'chirish
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
    }

    if (user.role === 'superadmin') {
      return res.status(403).json({ success: false, message: 'SuperAdmin hisobini tizimdan o\'chirib bo\'lmaydi' });
    }

    // Shifokor profili mavjud bo'lsa, avval uni tozalash
    await Doctor.destroy({ where: { userId: user.id } });

    await user.destroy();
    res.status(200).json({
      success: true,
      message: 'Foydalanuvchi tizimdan o\'chirildi',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
