/**
 * Mock Patients API with pagination and search
 */

const basePatients = [
  {
    id: 'P-1042',
    name: 'Anvar Qosimov',
    phone: '+998 90 842 11 00',
    birthdate: '14.08.1989',
    age: 34,
    lastVisit: '18-Sentabr, 2026',
    lastProcedure: 'Karies davolash',
    nextVisit: '25-Sentabr, 2026 • 10:00',
    status: 'today',
    allergies: 'Penitsillin',
    notes: 'Doimiy bemor, og\'riq sezuvchanligi past',
    balance: 0
  },
  {
    id: 'P-1043',
    name: 'Malika Saidova',
    phone: '+998 93 319 44 28',
    birthdate: '22.11.1995',
    age: 28,
    lastVisit: '18-Sentabr, 2026',
    lastProcedure: 'Ortodontik ko\'rik',
    nextVisit: '25-Sentabr, 2026 • 14:30',
    status: 'scheduled',
    allergies: 'Yo\'q',
    notes: 'Elastik tortqichlar almashtirildi',
    balance: 240000
  },
  {
    id: 'P-1044',
    name: 'Jamshid Karimov',
    phone: '+998 97 711 09 85',
    birthdate: '03.04.1982',
    age: 42,
    lastVisit: '18-Sentabr, 2026',
    lastProcedure: 'Tish tozalash',
    nextVisit: '25-Sentabr, 2026 • 11:30',
    status: 'today',
    allergies: 'Lidokain (ehtiyotkorlik)',
    notes: 'Profilaktik tozalash har 6 oyda',
    balance: 0
  },
  {
    id: 'P-1045',
    name: 'Nilufar Rahimova',
    phone: '+998 91 445 22 19',
    birthdate: '19.06.1991',
    age: 32,
    lastVisit: '18-Sentabr, 2026',
    lastProcedure: 'Tish oqartirish',
    nextVisit: '18-Sentabr, 2026 • 14:00',
    status: 'today',
    allergies: 'Yo\'q',
    notes: 'Zoom 4 kursi',
    balance: 500000
  },
  {
    id: 'P-1046',
    name: 'Bobur Mirzayev',
    phone: '+998 99 812 60 70',
    birthdate: '30.01.1978',
    age: 46,
    lastVisit: '15-Sentabr, 2026',
    lastProcedure: 'Implantatsiya',
    nextVisit: '18-Sentabr, 2026 • 15:30',
    status: 'today',
    allergies: 'Yo\'q',
    notes: 'Straumann #46 integratsiya jarayoni',
    balance: 1200000
  },
  {
    id: 'P-1047',
    name: 'Shahnoza Aliyeva',
    phone: '+998 90 998 12 34',
    birthdate: '11.09.2001',
    age: 22,
    lastVisit: '12-aprel, 2024',
    lastProcedure: 'Konsultatsiya',
    nextVisit: '24-may, 2024 • 17:00',
    status: 'today',
    allergies: 'Yo\'q',
    notes: 'Karies profilaktikasi',
    balance: 0
  },
  {
    id: 'P-1048',
    name: 'Otabek Soliyev',
    phone: '+998 94 650 33 22',
    birthdate: '08.12.1985',
    age: 38,
    lastVisit: '18-may, 2024',
    lastProcedure: 'Plomba almashtirish',
    nextVisit: '02-iyun, 2024 • 09:30',
    status: 'scheduled',
    allergies: 'Aspirin',
    notes: '#36 tish davolandi',
    balance: 350000
  },
  {
    id: 'P-1049',
    name: 'Dilnoza Karimova',
    phone: '+998 93 502 11 88',
    birthdate: '15.03.1997',
    age: 27,
    lastVisit: '21-may, 2024',
    lastProcedure: 'Breket korreksiyasi',
    nextVisit: '18-iyun, 2024 • 16:00',
    status: 'scheduled',
    allergies: 'Yo\'q',
    notes: 'Damon Q tizimi',
    balance: 0
  },
  {
    id: 'P-1050',
    name: 'Sardor Rashidov',
    phone: '+998 90 333 44 55',
    birthdate: '05.07.1990',
    age: 33,
    lastVisit: '22-may, 2024',
    lastProcedure: 'Endodontik davolash',
    nextVisit: '29-may, 2024 • 12:00',
    status: 'debtor',
    allergies: 'Yo\'q',
    notes: '#16 tish kanallari plombalandi',
    balance: 850000
  },
  {
    id: 'P-1051',
    name: 'Zulayho Umarova',
    phone: '+998 97 123 78 90',
    birthdate: '25.05.1993',
    age: 31,
    lastVisit: '23-may, 2024',
    lastProcedure: 'Vinir konsultatsiyasi',
    nextVisit: '05-iyun, 2024 • 15:00',
    status: 'scheduled',
    allergies: 'Lateks',
    notes: 'E-max 6 ta oldingi tishlar rejalashtirildi',
    balance: 0
  }
];

// Generate 342 total records for realistic virtualization and search
const firstNames = ['Aziz', 'Bekzod', 'Gulnoza', 'Diyor', 'Jasur', 'Lola', 'Madina', 'Nodir', 'Olim', 'Rustam', 'Sanjar', 'Umida', 'Farrux', 'Hilola', 'Shavkat', 'Zilola', 'Sherzod', 'Kamola', 'Muzaffar', 'Nilufar'];
const lastNames = ['Karimov', 'Azimov', 'Tursunov', 'Ahmedov', 'Yusupov', 'Sobirov', 'Nazarov', 'Ismoilov', 'Abdullayev', 'Murodov', 'Rahimov', 'Qodirov', 'Xoliqov', 'Ergashev', 'G\'ofurov'];
const procedures = ['Karies davolash', 'Plomba o\'rnatish', 'Tish tozalash (Air-Flow)', 'Endodontiya', 'Breket ko\'rik', 'Implantatsiya', 'Tish sug\'urish', 'Rentgen', 'Toj o\'rnatish', 'Flyuorizatsiya'];

const fullPatients = [...basePatients];
for (let i = fullPatients.length; i < 342; i++) {
  const fn = firstNames[i % firstNames.length];
  const ln = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
  const pId = `P-${1042 + i}`;
  const proc = procedures[i % procedures.length];
  const hasDebt = i % 15 === 0;
  const isScheduled = i % 3 === 0;
  
  fullPatients.push({
    id: pId,
    name: `${fn} ${ln}`,
    phone: `+998 9${(i % 5) + 0} ${Math.floor(100 + Math.random() * 899)} ${Math.floor(10 + Math.random() * 89)} ${Math.floor(10 + Math.random() * 89)}`,
    birthdate: `${(i % 28) + 1}.0${(i % 9) + 1}.${1970 + (i % 35)}`,
    age: 18 + (i % 55),
    lastVisit: `${(i % 25) + 1}-may, 2024`,
    lastProcedure: proc,
    nextVisit: isScheduled ? `${((i + 3) % 28) + 1}-iyun, 2024 • ${10 + (i % 8)}:00` : 'Rejalashtirilmagan',
    status: hasDebt ? 'debtor' : (i % 7 === 0 ? 'today' : (isScheduled ? 'scheduled' : 'all')),
    allergies: i % 10 === 0 ? 'Penitsillin' : 'Yo\'q',
    notes: 'Klinik karta faol',
    balance: hasDebt ? (i * 120000) % 1500000 : 0
  });
}

export const patientsApi = {
  async getAll({ search = '', filter = 'all', page = 1, pageSize = 30 } = {}) {
    await new Promise((r) => setTimeout(r, 180));
    let filtered = fullPatients;

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.lastProcedure.toLowerCase().includes(q)
      );
    }

    if (filter === 'today') {
      filtered = filtered.filter((p) => p.status === 'today');
    } else if (filter === 'scheduled') {
      filtered = filtered.filter((p) => p.status === 'scheduled');
    } else if (filter === 'debtor') {
      filtered = filtered.filter((p) => p.status === 'debtor' || p.balance > 0);
    }

    const total = filtered.length;
    const startIndex = (page - 1) * pageSize;
    const items = filtered.slice(startIndex, startIndex + pageSize);

    const counts = {
      all: fullPatients.length,
      today: fullPatients.filter((p) => p.status === 'today').length,
      scheduled: fullPatients.filter((p) => p.status === 'scheduled').length,
      debtor: fullPatients.filter((p) => p.status === 'debtor' || p.balance > 0).length
    };

    return {
      items,
      total,
      fullFilteredCount: total,
      page,
      pageSize,
      allTotalCount: fullPatients.length,
      counts
    };
  },

  async getById(id) {
    await new Promise((r) => setTimeout(r, 150));
    const patient = fullPatients.find((p) => p.id === id || p.id === `P-${id}`);
    return patient || fullPatients[0];
  },

  async create(newPatient) {
    await new Promise((r) => setTimeout(r, 300));
    const created = {
      ...newPatient,
      id: `P-${1042 + fullPatients.length}`,
      lastVisit: 'Bugun',
      lastProcedure: 'Dastlabki ko\'rik',
      nextVisit: 'Rejalashtirilmagan',
      status: 'all',
      balance: 0
    };
    fullPatients.unshift(created);
    return created;
  }
};
