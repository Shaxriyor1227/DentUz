
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

    // 1. Clinic
    const clinic = await db.Clinic.create({
      name: 'DentUz Markaziy Klinika',
      address: 'Toshkent sh., Amir Temur shox ko\'chasi 15-uy',
      phone: '+998 71 200 00 00',
      workingHours: '09:00 - 20:00',
      subscriptionPlan: 'pro',
    });
    console.log(`✅ Klinika yaratildi: ${clinic.name}`);

    // 2. Users (Password: Password123!)
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
        title: 'Administrator',
        email: 'admin@dentuz.uz',
        password: 'Password123!',
        role: 'receptionist',
        phone: '+998 99 800 11 22',
        clinicId: clinic.id,
      },
    ];

    const users = await Promise.all(usersData.map((u) => db.User.create(u)));
    console.log(`✅ ${users.length} ta foydalanuvchi yaratildi (parol: Password123!)`);

    // 3. Doctors profiles
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

    // 4. Patients
    const patientsData = [
      {
        id: 'P-1001',
        name: 'Alisher Usmonov',
        phone: '+998 90 123 45 67',
        birthdate: '1988-04-12',
        age: 38,
        lastVisit: '2026-03-10',
        lastProcedure: 'Karies davolash',
        status: 'today',
        allergies: 'Penitsillin',
        notes: 'Yuqori sezgirlik bor',
        balance: 0,
        clinicId: clinic.id,
      },
      {
        id: 'P-1002',
        name: 'Zilola Karimova',
        phone: '+998 93 987 65 43',
        birthdate: '1995-09-20',
        age: 31,
        lastVisit: '2026-02-15',
        lastProcedure: 'Breket o\'rnatish',
        status: 'scheduled',
        allergies: 'Yo\'q',
        notes: 'Navbatdagi tekshiruv har oy',
        balance: 1500000,
        clinicId: clinic.id,
      },
      {
        id: 'P-1003',
        name: 'Olimjon Tohirov',
        phone: '+998 97 555 12 34',
        birthdate: '1982-11-05',
        age: 44,
        lastVisit: '2026-01-22',
        lastProcedure: 'Implantatsiya 1-bosqich',
        status: 'debtor',
        allergies: 'Yo\'q',
        notes: 'Qarz to\'lovi kutilmoqda',
        balance: -2800000,
        clinicId: clinic.id,
      },
      {
        id: 'P-1004',
        name: 'Madina Ahmedova',
        phone: '+998 91 777 88 99',
        birthdate: '2001-03-14',
        age: 25,
        lastVisit: '2026-03-15',
        lastProcedure: 'Tish tozalash (Air-flow)',
        status: 'today',
        allergies: 'Lidokain',
        notes: 'Ultratovush tozalash tavsiya etilgan',
        balance: 0,
        clinicId: clinic.id,
      },
    ];

    const patients = await Promise.all(patientsData.map((p) => db.Patient.create(p)));
    console.log(`✅ ${patients.length} ta bemor yaratildi`);

    // 5. Appointments
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
        date: new Date().toISOString().split('T')[0],
        chair: 1,
        color: 'emerald',
        clinicId: clinic.id,
      },
      {
        id: 'apt-2',
        time: '11:00',
        duration: 60,
        patientId: patients[3].id,
        patientName: patients[3].name,
        procedure: 'Tish tozalash',
        doctorId: doctors[1].id,
        doctorSlug: 'saidova',
        doctorName: 'Dr. Malika Saidova',
        status: 'pending',
        day: 'mon',
        date: new Date().toISOString().split('T')[0],
        chair: 2,
        color: 'cyan',
        clinicId: clinic.id,
      },
    ];

    const appointments = await Promise.all(appointmentsData.map((a) => db.Appointment.create(a)));
    console.log(`✅ ${appointments.length} ta qabul (appointment) yaratildi`);

    // 6. Invoices
    const invoicesData = [
      {
        id: 'INV-2026-001',
        patientId: patients[0].id,
        patient: patients[0].name,
        doctor: 'Dr. Jasur Azimov',
        procedure: 'Karies davolash',
        method: 'Payme',
        amount: 450000,
        status: 'paid',
        clinicId: clinic.id,
      },
      {
        id: 'INV-2026-002',
        patientId: patients[2].id,
        patient: patients[2].name,
        doctor: 'Dr. Jasur Azimov',
        procedure: 'Implantatsiya',
        method: 'Naqd',
        amount: 3200000,
        status: 'partial',
        clinicId: clinic.id,
      },
    ];

    const invoices = await Promise.all(invoicesData.map((inv) => db.Invoice.create(inv)));
    console.log(`✅ ${invoices.length} ta hisob-faktura (invoice) yaratildi`);

    // 7. Odontogram for Patient 1
    const odontogram = await db.Odontogram.create({
      patientId: patients[0].id,
      teeth: {
        '16': { condition: 'caries', notes: 'Okluzal karies chuqur' },
        '11': { condition: 'healthy', notes: '' },
        '21': { condition: 'healthy', notes: '' },
        '26': { condition: 'filled', notes: 'Fotopolimer plomba 2024' },
        '36': { condition: 'missing', notes: '2023-yilda olingan' },
        '46': { condition: 'crown', notes: 'Tsirkoniy qoplama' },
      },
      lastUpdatedBy: users[0].id,
    });
    console.log(`✅ Odontogramma yaratildi bemor uchun: ${patients[0].name}`);

    console.log('\n🎉 Seed muvaffaqiyatli yakunlandi!');
    console.log('-------------------------------------------');
    console.log('Klinika: DentUz Markaziy Klinika');
    console.log('Login: j.azimov@dentuz.uz (Owner)');
    console.log('Login: m.saidova@dentuz.uz (Doctor)');
    console.log('Login: admin@dentuz.uz (Admin)');
    console.log('Parol: Password123!');
    console.log('-------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed xatosi:', error);
    process.exit(1);
  }
};

seed();
