require('dotenv').config();
const db = require('../models');

const seed = async () => {
  try {
    console.log('🔄 Baza bilan ulanish tekshirilmoqda...');
    await db.sequelize.authenticate();
    console.log('✅ PostgreSQL ulanishi muvaffaqiyatli.');

    console.log('🔄 Jadvallar tozalash va yaratish (force sync)...');
    await db.sequelize.sync({ force: true });
    console.log('✅ Jadvallar yaratildi.');

    // 1. Asosiy Klinika (Multi-tenant Tenant 1)
    const clinic = await db.Clinic.create({
      name: 'DentUz Markaziy Klinika',
      address: 'Toshkent sh., Amir Temur shox ko\'chasi 15-uy',
      phone: '+998 71 200 00 00',
      workingHours: '09:00 - 20:00',
      subscriptionPlan: 'pro',
    });
    console.log(`✅ Klinika yaratildi: ${clinic.name}`);

    // 2. Foydalanuvchilar (Xodimlar)
    const usersData = [
      {
        name: 'Dr. Jasur Azimov',
        shortName: 'Dr. Azimov',
        title: 'Bosh shifokor • Implantolog',
        email: 'j.azimov@dentuz.uz',
        password: 'Password123!',
        role: 'owner',
        phone: '+998 90 123 45 67',
        avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150',
        clinicId: clinic.id,
      },
      {
        name: 'Dr. Malika Saidova',
        shortName: 'Dr. Saidova',
        title: 'Ortodont',
        email: 'm.saidova@dentuz.uz',
        password: 'Password123!',
        role: 'doctor',
        phone: '+998 93 319 44 28',
        avatarUrl: 'https://images.unsplash.com/photo-1594824813576-2f085731f822?w=150',
        clinicId: clinic.id,
      },
      {
        name: 'Dr. Jamshid Karimov',
        shortName: 'Dr. Karimov',
        title: 'Terapevt-Stomatolog',
        email: 'j.karimov@dentuz.uz',
        password: 'Password123!',
        role: 'doctor',
        phone: '+998 97 711 09 85',
        avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150',
        clinicId: clinic.id,
      },
      {
        name: 'Nilufar Rahimova',
        shortName: 'N. Rahimova',
        title: 'Bosh assistent • Hamshira',
        email: 'n.rahimova@dentuz.uz',
        password: 'Password123!',
        role: 'nurse',
        phone: '+998 91 445 22 19',
        clinicId: clinic.id,
      },
      {
        name: 'Bobur Mirzayev',
        shortName: 'B. Mirzayev',
        title: 'Administrator / Qabulxona',
        email: 'admin@dentuz.uz',
        password: 'Password123!',
        role: 'receptionist',
        phone: '+998 99 800 11 22',
        clinicId: clinic.id,
      },
    ];

    const users = await Promise.all(usersData.map((u) => db.User.create(u)));
    console.log(`✅ ${users.length} ta foydalanuvchi yaratildi (parol: Password123!)`);

    // 3. Shifokorlar profili
    const doctors = await Promise.all([
      db.Doctor.create({
        userId: users[0].id,
        clinicId: clinic.id,
        specialization: 'Bosh shifokor • Implantolog',
        cabinetNumber: 1,
        workingHours: '09:00-18:00',
      }),
      db.Doctor.create({
        userId: users[1].id,
        clinicId: clinic.id,
        specialization: 'Ortodont',
        cabinetNumber: 2,
        workingHours: '09:00-17:00',
      }),
      db.Doctor.create({
        userId: users[2].id,
        clinicId: clinic.id,
        specialization: 'Terapevt-Stomatolog',
        cabinetNumber: 3,
        workingHours: '10:00-19:00',
      }),
    ]);
    console.log(`✅ ${doctors.length} ta shifokor profili yaratildi`);

    // 4. Bemorlar (Patients)
    const patientsData = [
      {
        id: 'P-1042',
        name: 'Anvar Qosimov',
        phone: '+998 90 842 11 00',
        birthdate: '1989-08-14',
        age: 35,
        lastVisit: '2026-03-18',
        lastProcedure: 'Karies davolash',
        status: 'today',
        allergies: 'Penitsillin',
        notes: 'Doimiy bemor, og\'riq sezuvchanligi past',
        balance: 0,
        clinicId: clinic.id,
      },
      {
        id: 'P-1043',
        name: 'Malika Saidova',
        phone: '+998 93 319 44 28',
        birthdate: '1995-11-22',
        age: 29,
        lastVisit: '2026-03-18',
        lastProcedure: 'Ortodontik ko\'rik',
        status: 'scheduled',
        allergies: 'Yo\'q',
        notes: 'Elastik tortqichlar almashtirildi',
        balance: 240000,
        clinicId: clinic.id,
      },
      {
        id: 'P-1044',
        name: 'Jamshid Karimov',
        phone: '+998 97 711 09 85',
        birthdate: '1982-04-03',
        age: 43,
        lastVisit: '2026-03-18',
        lastProcedure: 'Tish tozalash',
        status: 'today',
        allergies: 'Lidokain (ehtiyotkorlik)',
        notes: 'Profilaktik tozalash har 6 oyda',
        balance: 0,
        clinicId: clinic.id,
      },
      {
        id: 'P-1045',
        name: 'Nilufar Rahimova',
        phone: '+998 91 445 22 19',
        birthdate: '1991-06-19',
        age: 33,
        lastVisit: '2026-03-18',
        lastProcedure: 'Tish oqartirish',
        status: 'today',
        allergies: 'Yo\'q',
        notes: 'Zoom 4 kursi o\'tkazildi',
        balance: 0,
        clinicId: clinic.id,
      },
      {
        id: 'P-1046',
        name: 'Farrux Zokirov',
        phone: '+998 90 912 34 56',
        birthdate: '1976-12-08',
        age: 48,
        lastVisit: '2026-03-15',
        lastProcedure: 'Implantatsiya',
        status: 'debtor',
        allergies: 'Yo\'q',
        notes: 'Ikkinchi bosqich to\'lovi qolgan',
        balance: -1800000,
        clinicId: clinic.id,
      },
      {
        id: 'P-1047',
        name: 'Shahlo Umarova',
        phone: '+998 94 654 32 10',
        birthdate: '1998-02-27',
        age: 26,
        lastVisit: '2026-03-10',
        lastProcedure: 'Retinirlangan tish olish',
        status: 'scheduled',
        allergies: 'Aspirin',
        notes: 'Tiklanish davri nazoratda',
        balance: 0,
        clinicId: clinic.id,
      },
    ];

    const patients = await Promise.all(patientsData.map((p) => db.Patient.create(p)));
    console.log(`✅ ${patients.length} ta bemor yaratildi`);

    // 5. Qabullar (Appointments)
    const today = new Date().toISOString().split('T')[0];
    const appointmentsData = [
      {
        id: 'apt-1',
        time: '09:00',
        duration: 45,
        patientId: patients[0].id,
        patientName: patients[0].name,
        procedure: 'Karies davolash',
        doctorId: doctors[0].id,
        doctorSlug: 'azimov',
        doctorName: 'Dr. Jasur Azimov',
        status: 'in_progress',
        day: 'mon',
        date: today,
        chair: 1,
        color: 'emerald',
        clinicId: clinic.id,
      },
      {
        id: 'apt-2',
        time: '10:15',
        duration: 60,
        patientId: patients[1].id,
        patientName: patients[1].name,
        procedure: 'Breket korreksiyasi',
        doctorId: doctors[1].id,
        doctorSlug: 'saidova',
        doctorName: 'Dr. Malika Saidova',
        status: 'pending',
        day: 'mon',
        date: today,
        chair: 2,
        color: 'cyan',
        clinicId: clinic.id,
      },
      {
        id: 'apt-3',
        time: '11:30',
        duration: 45,
        patientId: patients[2].id,
        patientName: patients[2].name,
        procedure: 'Tish tozalash',
        doctorId: doctors[2].id,
        doctorSlug: 'karimov',
        doctorName: 'Dr. Jamshid Karimov',
        status: 'pending',
        day: 'mon',
        date: today,
        chair: 3,
        color: 'amber',
        clinicId: clinic.id,
      },
    ];

    const appointments = await Promise.all(appointmentsData.map((a) => db.Appointment.create(a)));
    console.log(`✅ ${appointments.length} ta qabul yaratildi`);

    // 6. Xizmatlar preyskuranti (Services)
    const servicesData = [
      {
        name: 'Tish plombalash (Fotopolimer)',
        category: 'therapy',
        code: 'TH-01',
        price: 250000,
        duration: 45,
        description: 'Kariesni tozalash va fotopolimer kompozit plomba',
        isActive: true,
        clinicId: clinic.id,
      },
      {
        name: 'Professional gigiyenik tozalash (Air-Flow)',
        category: 'hygiene',
        code: 'HY-01',
        price: 350000,
        duration: 60,
        description: 'Tish toshlari va dog\'larni ultratovush orqali tozalash',
        isActive: true,
        clinicId: clinic.id,
      },
      {
        name: 'Tish implantatsiyasi (Osstem, Koreya)',
        category: 'surgery',
        code: 'SG-01',
        price: 3500000,
        duration: 90,
        description: 'Titanium implant va dastlabki suyak integratsiyasi',
        isActive: true,
        clinicId: clinic.id,
      },
      {
        name: 'Metall breket tizimi (ikkala jag\')',
        category: 'orthodontics',
        code: 'OR-01',
        price: 6000000,
        duration: 120,
        description: 'Klassik metall breketlar va o\'rnatish',
        isActive: true,
        clinicId: clinic.id,
      },
    ];
    await Promise.all(servicesData.map((s) => db.Service.create(s)));
    console.log(`✅ ${servicesData.length} ta xizmat yaratildi`);

    // 7. Ombor mollari (Inventory)
    const inventoryData = [
      {
        name: 'Septanest 1:100000 (Anesteziya)',
        category: 'medication',
        sku: 'MED-SEPT-01',
        unit: 'quti',
        quantity: 35,
        minQuantity: 10,
        costPrice: 180000,
        supplier: 'DentMarket Tashkent',
        expiryDate: '2027-12-31',
        clinicId: clinic.id,
      },
      {
        name: 'Filtek Z250 Universal Kompozit Plomba',
        category: 'consumable',
        sku: 'CON-FILT-01',
        unit: 'dona',
        quantity: 18,
        minQuantity: 5,
        costPrice: 220000,
        supplier: 'Dental Trade LLC',
        expiryDate: '2026-11-30',
        clinicId: clinic.id,
      },
      {
        name: 'Osstem TS III SA Implant (4.0 x 10mm)',
        category: 'implant',
        sku: 'IMP-OSST-01',
        unit: 'dona',
        quantity: 12,
        minQuantity: 3,
        costPrice: 1200000,
        supplier: 'Osstem Uzbekistan',
        expiryDate: '2029-06-30',
        clinicId: clinic.id,
      },
    ];
    await Promise.all(inventoryData.map((inv) => db.Inventory.create(inv)));
    console.log(`✅ ${inventoryData.length} ta ombor mahsuloti yaratildi`);

    // 8. Hisob-fakturalar (Invoices)
    const invoicesData = [
      {
        id: 'INV-2026-001',
        patientId: patients[0].id,
        patient: patients[0].name,
        doctor: 'Dr. Jasur Azimov',
        procedure: 'Karies davolash',
        date: today,
        method: 'Payme',
        amount: 250000,
        status: 'paid',
        clinicId: clinic.id,
      },
      {
        id: 'INV-2026-002',
        patientId: patients[1].id,
        patient: patients[1].name,
        doctor: 'Dr. Malika Saidova',
        procedure: 'Breket korreksiyasi',
        date: today,
        method: 'Click',
        amount: 300000,
        status: 'paid',
        clinicId: clinic.id,
      },
      {
        id: 'INV-2026-003',
        patientId: patients[4].id,
        patient: patients[4].name,
        doctor: 'Dr. Jasur Azimov',
        procedure: 'Implantatsiya',
        date: today,
        method: 'Naqd',
        amount: 3500000,
        status: 'partial',
        clinicId: clinic.id,
      },
    ];
    await Promise.all(invoicesData.map((inv) => db.Invoice.create(inv)));
    console.log(`✅ ${invoicesData.length} ta hisob-faktura yaratildi`);

    // 9. Odontogramma
    await db.Odontogram.create({
      patientId: patients[0].id,
      teeth: {
        '16': { condition: 'caries', notes: 'Okluzal karies' },
        '11': { condition: 'healthy', notes: '' },
        '21': { condition: 'healthy', notes: '' },
        '26': { condition: 'filled', notes: 'Fotopolimer plomba' },
        '36': { condition: 'missing', notes: 'Olingan tish' },
        '46': { condition: 'crown', notes: 'Tsirkoniy toji' },
      },
      lastUpdatedBy: users[0].id,
    });
    console.log(`✅ Odontogramma yaratildi bemor uchun: ${patients[0].name}`);

    console.log('\n🎉 Seed muvaffaqiyatli yakunlandi!');
    console.log('-------------------------------------------');
    console.log('Klinika: DentUz Markaziy Klinika');
    console.log('Login: j.azimov@dentuz.uz (Owner)');
    console.log('Login: m.saidova@dentuz.uz (Doctor)');
    console.log('Login: admin@dentuz.uz (Receptionist)');
    console.log('Parol: Password123!');
    console.log('-------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed xatosi:', error);
    process.exit(1);
  }
};

seed();
