/**
 * Mock Appointments API - Dynamically aligned with current local date
 */

function getWeekDates() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);

  const getDayDate = (offset) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + offset);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  };

  return {
    mon: getDayDate(0),
    tue: getDayDate(1),
    wed: getDayDate(2),
    thu: getDayDate(3),
    fri: getDayDate(4),
    sat: getDayDate(5),
    sun: getDayDate(6)
  };
}

const currentWeekDates = getWeekDates();

let appointments = [
  {
    id: 'apt-1',
    time: '09:00',
    duration: 45,
    patientId: 'P-1042',
    patientName: 'Anvar Qosimov',
    procedure: 'Karies davolash',
    doctor: 'azimov',
    doctorName: 'Dr. Azimov Farrux',
    status: 'completed',
    day: 'fri',
    date: currentWeekDates.fri,
    chair: 1,
    color: '#10B981'
  },
  {
    id: 'apt-2',
    time: '10:15',
    duration: 60,
    patientId: 'P-1043',
    patientName: 'Malika Saidova',
    procedure: 'Konsultatsiya & R-grafiya',
    doctor: 'saidova',
    doctorName: 'Dr. Saidova Malika',
    status: 'completed',
    day: 'fri',
    date: currentWeekDates.fri,
    chair: 2,
    color: '#3B82F6'
  },
  {
    id: 'apt-3',
    time: '11:30',
    duration: 45,
    patientId: 'P-1044',
    patientName: 'Jamshid Karimov',
    procedure: "Ortodontik ko'rik",
    doctor: 'karimov',
    doctorName: 'Dr. Karimov Jamshid',
    status: 'completed',
    day: 'fri',
    date: currentWeekDates.fri,
    chair: 3,
    color: '#F59E0B'
  },
  {
    id: 'apt-4',
    time: '14:00',
    duration: 60,
    patientId: 'P-1045',
    patientName: 'Nilufar Rahimova',
    procedure: 'Tish tozalash (Air-Flow)',
    doctor: 'azimov',
    doctorName: 'Dr. Azimov Farrux',
    status: 'in_progress',
    day: 'fri',
    date: currentWeekDates.fri,
    chair: 1,
    color: '#06B6D4'
  },
  {
    id: 'apt-5',
    time: '15:30',
    duration: 60,
    patientId: 'P-1046',
    patientName: 'Bobur Mirzayev',
    procedure: 'Implantatsiya tekshiruvi',
    doctor: 'azimov',
    doctorName: 'Dr. Azimov Farrux',
    status: 'pending',
    day: 'fri',
    date: currentWeekDates.fri,
    chair: 1,
    color: '#64748B'
  },
  {
    id: 'apt-6',
    time: '17:00',
    duration: 45,
    patientId: 'P-1047',
    patientName: 'Shahnoza Aliyeva',
    procedure: 'Tish oqartirish (Zoom 4)',
    doctor: 'saidova',
    doctorName: 'Dr. Saidova Malika',
    status: 'pending',
    day: 'fri',
    date: currentWeekDates.fri,
    chair: 2,
    color: '#3B82F6'
  },
  {
    id: 'apt-7',
    time: '10:00',
    duration: 60,
    patientId: 'P-1048',
    patientName: 'Otabek Soliyev',
    procedure: 'Plomba almashtirish',
    doctor: 'karimov',
    doctorName: 'Dr. Karimov Jamshid',
    status: 'pending',
    day: 'mon',
    date: currentWeekDates.mon,
    chair: 1,
    color: '#F59E0B'
  },
  {
    id: 'apt-8',
    time: '11:00',
    duration: 60,
    patientId: 'P-1049',
    patientName: 'Dilnoza Karimova',
    procedure: 'Breket korreksiyasi',
    doctor: 'saidova',
    doctorName: 'Dr. Saidova Malika',
    status: 'completed',
    day: 'tue',
    date: currentWeekDates.tue,
    chair: 2,
    color: '#3B82F6'
  },
  {
    id: 'apt-9',
    time: '14:30',
    duration: 45,
    patientId: 'P-1050',
    patientName: 'Sardor Rashidov',
    procedure: 'Endodontik davolash',
    doctor: 'azimov',
    doctorName: 'Dr. Azimov Farrux',
    status: 'completed',
    day: 'wed',
    date: currentWeekDates.wed,
    chair: 1,
    color: '#10B981'
  },
  {
    id: 'apt-10',
    time: '16:00',
    duration: 60,
    patientId: 'P-1051',
    patientName: 'Zulayho Umarova',
    procedure: 'Keramik vinir konsultatsiyasi',
    doctor: 'azimov',
    doctorName: 'Dr. Azimov Farrux',
    status: 'completed',
    day: 'thu',
    date: currentWeekDates.thu,
    chair: 3,
    color: '#10B981'
  },
  {
    id: 'apt-11',
    time: '12:00',
    duration: 45,
    patientId: 'P-1052',
    patientName: 'Nodir Ergashev',
    procedure: 'Gigiyenik tozalash',
    doctor: 'karimov',
    doctorName: 'Dr. Karimov Jamshid',
    status: 'pending',
    day: 'sat',
    date: currentWeekDates.sat,
    chair: 2,
    color: '#F59E0B'
  }
];

export const appointmentsApi = {
  async getAll() {
    await new Promise((r) => setTimeout(r, 200));
    return [...appointments];
  },

  async getToday() {
    await new Promise((r) => setTimeout(r, 150));
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return appointments.filter((a) => a.date === todayStr);
  },

  async update(id, updates) {
    await new Promise((r) => setTimeout(r, 300));
    const idx = appointments.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Appointment not found');
    appointments[idx] = { ...appointments[idx], ...updates };
    return { ...appointments[idx] };
  },

  async create(newApt) {
    await new Promise((r) => setTimeout(r, 300));
    const created = {
      ...newApt,
      id: `apt-${Date.now()}`,
      status: 'pending',
      color: newApt.color || '#64748B'
    };
    appointments.push(created);
    return created;
  }
};
