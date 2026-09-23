/**
 * Mock Patients API with pagination and search
 */
import apiClient from './client';

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

// Generate 1,250 total records for realistic virtualization and deep testing
const maleFirstNames = ['Aziz', 'Bekzod', 'Diyor', 'Jasur', 'Nodir', 'Olim', 'Rustam', 'Sanjar', 'Farrux', 'Shavkat', 'Sherzod', 'Muzaffar', 'Bobur', 'Otabek', 'Sardor', 'Javohir', 'Shohruh', 'Elyor', 'Doniyor', 'Alisher', 'Temur', 'Eldor', 'Abbos', 'Anvar', 'Davron', 'Jahongir', 'Xurshid', 'Umid', 'Ilhom', 'Akmal'];
const femaleFirstNames = ['Gulnoza', 'Lola', 'Madina', 'Umida', 'Hilola', 'Zilola', 'Kamola', 'Nilufar', 'Shahlo', 'Shahnoza', 'Dildora', 'Nargiza', 'Mohira', 'Sevara', 'Feruza', 'Dilfuza', 'Nigora', 'Rayhon', 'Ziyoda', 'Yulduz', 'Nozima', 'Munisa', 'Go\'zal', 'Zarnigor', 'Sabina', 'Malika', 'Zulayho', 'Ozoda'];
const lastNamesRoots = ['Karim', 'Azim', 'Tursun', 'Ahmed', 'Yusup', 'Sobir', 'Nazar', 'Ismoil', 'Abdullay', 'Murod', 'Rahim', 'Qodir', 'Xoliq', 'Ergash', 'G\'ofur', 'Aliy', 'Said', 'Umar', 'Soliy', 'Rashid', 'Mahmud', 'Sharip', 'Jalil', 'Toir', 'Yoqub', 'Boboy', 'Vohid', 'Mirzay', 'Normat', 'Jo\'ray'];

const procedures = [
  'Karies davolash va kompozit plomba',
  'Tish tozalash (Air-Flow va ultratovush)',
  'Endodontik davolash (ildiz kanallari)',
  'Metallokeramika toj o\'rnatish',
  'Tsirkoniy oksidi estetik koronka',
  'Damon Q breket korreksiyasi',
  'Straumann implantatsiyasi',
  'Tish oqartirish (Zoom 4 texnologiyasi)',
  'Aql tishini jarrohlik yo\'li bilan olish',
  'E-max keramika vinirlar konsultatsiyasi',
  'Bolalar tish profilaktikasi va silantlash',
  'Flyuorizatsiya va remoterapiya',
  'Sinus-lifting va suyak plastikasi',
  'Byugel protez tekshiruvi va korreksiyasi',
  'Gingivit va parodontit muolajasi',
  'Tish sezuvchanligini pasaytirish (Desensitayzer)'
];

const allergyList = ['Yo\'q', 'Yo\'q', 'Yo\'q', 'Yo\'q', 'Penitsillin', 'Lidokain', 'Lateks', 'Aspirin', 'Novokain'];

const notesList = [
  'Doimiy bemor, profilaktik ko\'rik rejalashtirilgan',
  'Sezuvchanlik yuqori, og\'riqsizlantirish talab etiladi',
  'Davolash rejasi tuzilgan va tasdiqlangan',
  'Rentgen suratlari arxivlangan, yaxshi dinamika',
  'Ortodontik muolaja bosqichi davom etmoqda',
  'Klinik karta faol, gigiyenik tavsiyalar berilgan',
  'Plomba kafolati doirasida nazorat ko\'rigi',
  'Implantatsiya muvaffaqiyatli integratsiya jarayonida'
];

const fullPatients = [...basePatients];
for (let i = fullPatients.length; i < 1250; i++) {
  const isMale = i % 2 === 0;
  const fn = isMale
    ? maleFirstNames[i % maleFirstNames.length]
    : femaleFirstNames[i % femaleFirstNames.length];
  const rootLn = lastNamesRoots[(i + Math.floor(i / maleFirstNames.length)) % lastNamesRoots.length];
  const ln = isMale ? `${rootLn}ov` : `${rootLn}ova`;
  const pId = `P-${1042 + i}`;
  const proc = procedures[i % procedures.length];
  
  // Status distributions:
  // ~12% today, ~45% scheduled, ~18% debtor, remainder all
  const statusMod = i % 20;
  let status = 'all';
  let balance = 0;
  let nextVisit = 'Rejalashtirilmagan';

  if (statusMod === 0 || statusMod === 7 || statusMod === 14) {
    status = 'today';
    const hours = ['09:00', '10:15', '11:30', '14:00', '15:15', '16:30', '17:45', '18:30'];
    nextVisit = `Bugun • ${hours[i % hours.length]}`;
  } else if (statusMod === 3 || statusMod === 8 || statusMod === 13 || statusMod === 17) {
    status = 'debtor';
    const debts = [150000, 280000, 450000, 750000, 1200000, 1850000, 2400000, 3600000];
    balance = debts[i % debts.length];
    nextVisit = `${((i % 25) + 1)}-Oktabr, 2026 • 11:00`;
  } else if (statusMod % 2 === 0) {
    status = 'scheduled';
    const days = (i % 28) + 1;
    const hour = 9 + (i % 8);
    nextVisit = `${days}-Oktabr, 2026 • ${hour < 10 ? '0' : ''}${hour}:00`;
  }

  const birthYear = 1965 + (i % 42);
  const birthMonth = ((i % 12) + 1).toString().padStart(2, '0');
  const birthDay = ((i % 28) + 1).toString().padStart(2, '0');
  const age = 2026 - birthYear;

  const phonePrefixes = ['90', '91', '93', '94', '95', '97', '98', '99', '88', '77', '33'];
  const pfx = phonePrefixes[i % phonePrefixes.length];
  const p1 = Math.floor(100 + (Math.sin(i * 13) * 0.5 + 0.5) * 899);
  const p2 = Math.floor(10 + (Math.cos(i * 17) * 0.5 + 0.5) * 89);
  const p3 = Math.floor(10 + (Math.sin(i * 23) * 0.5 + 0.5) * 89);
  const phone = `+998 ${pfx} ${p1} ${p2} ${p3}`;

  const lastVisitDay = ((i % 22) + 1);

  fullPatients.push({
    id: pId,
    name: `${fn} ${ln}`,
    phone,
    birthdate: `${birthDay}.${birthMonth}.${birthYear}`,
    age,
    lastVisit: `${lastVisitDay}-Sentabr, 2026`,
    lastProcedure: proc,
    nextVisit,
    status,
    allergies: allergyList[i % allergyList.length],
    notes: notesList[i % notesList.length],
    balance
  });
}

export const patientsApi = {
  async getAll({ search = '', filter = 'all', page = 1, pageSize = 30 } = {}) {
    if (!apiClient.isMockEnabled()) {
      try {
        const queryParams = new URLSearchParams({ page, limit: pageSize, pageSize, filter, search });
        const res = await apiClient.get(`/patients?${queryParams.toString()}`);
        if (res && (res.items || res.data)) {
          const items = res.items || res.data || [];
          return {
            items,
            data: items,
            total: res.total || items.length,
            fullFilteredCount: res.total || items.length,
            page: res.page || page,
            pageSize: res.limit || pageSize,
            allTotalCount: res.allTotalCount || res.total || items.length,
            counts: res.counts || {
              all: res.total || items.length,
              today: items.filter((p) => p.status === 'today').length,
              scheduled: items.filter((p) => p.status === 'scheduled').length,
              debtor: items.filter((p) => p.status === 'debtor' || Number(p.balance) < 0).length
            }
          };
        }
      } catch (err) {
        console.warn('Backend API unreachable, using local storage dataset:', err);
      }
    }

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
    if (!apiClient.isMockEnabled()) {
      try {
        const res = await apiClient.get(`/patients/${id}`);
        if (res && res.data) return res.data;
      } catch (err) {
        console.warn('Real Patient API getById failed, fallback to local:', err.message);
      }
    }
    await new Promise((r) => setTimeout(r, 150));
    const patient = fullPatients.find((p) => p.id === id || p.id === `P-${id}`);
    return patient || fullPatients[0];
  },

  async create(newPatient) {
    if (!apiClient.isMockEnabled()) {
      try {
        const res = await apiClient.post('/patients', newPatient);
        if (res && res.data) return res.data;
      } catch (err) {
        console.warn('Real Patient API create failed, fallback to local:', err.message);
      }
    }
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
