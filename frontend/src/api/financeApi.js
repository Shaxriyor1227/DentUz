/**
 * Mock Finance & Invoices API — returns different stats/invoices per date range
 */

const STATS_BY_PERIOD = {
  this_month: {
    monthlyRevenue: 148500000,
    revenueGrowth: 14.2,
    pendingPayments: 24800000,
    pendingCount: 32,
    expenses: 46200000,
    expensesGrowth: 3.1,
    netProfit: 102300000,
    netProfitGrowth: 18.4,
    label: "Shu oy (Sentabr 2026)"
  },
  last_month: {
    monthlyRevenue: 129900000,
    revenueGrowth: 8.7,
    pendingPayments: 18500000,
    pendingCount: 24,
    expenses: 44800000,
    expensesGrowth: -1.2,
    netProfit: 85100000,
    netProfitGrowth: 12.3,
    label: "O'tgan oy (Avgust 2026)"
  },
  custom: {
    monthlyRevenue: 74200000,
    revenueGrowth: 5.1,
    pendingPayments: 9300000,
    pendingCount: 12,
    expenses: 21400000,
    expensesGrowth: 2.4,
    netProfit: 52800000,
    netProfitGrowth: 7.8,
    label: "Tanlangan davr"
  }
};

const INVOICES_BY_PERIOD = {
  this_month: [
    {
      id: 'INV-2026-001',
      patient: 'Anvar Qosimov',
      patientId: 'P-1042',
      doctor: 'Dr. Azimov',
      procedure: 'Endodontiya va kompozit restavratsiya',
      date: '18-Sentabr, 2026 • 10:45',
      method: 'Payme',
      amount: 1450000,
      status: 'paid'
    },
    {
      id: 'INV-2026-002',
      patient: 'Malika Saidova',
      patientId: 'P-1043',
      doctor: 'Dr. Saidova',
      procedure: 'Breket korreksiyasi & gigiyenik tozalash',
      date: '18-Sentabr, 2026 • 11:20',
      method: 'Click',
      amount: 800000,
      status: 'paid'
    },
    {
      id: 'INV-2026-003',
      patient: 'Jamshid Karimov',
      patientId: 'P-1044',
      doctor: 'Dr. Karimov',
      procedure: 'Ortodontik ko\'rik va R-grafiya',
      date: '18-Sentabr, 2026 • 12:15',
      method: 'Naqd',
      amount: 350000,
      status: 'paid'
    },
    {
      id: 'INV-2026-004',
      patient: 'Nilufar Rahimova',
      patientId: 'P-1045',
      doctor: 'Dr. Azimov',
      procedure: 'Air-Flow tozalash kursi',
      date: '18-Sentabr, 2026 • 14:40',
      method: 'Uzcard',
      amount: 600000,
      status: 'pending'
    },
    {
      id: 'INV-2026-005',
      patient: 'Bobur Mirzayev',
      patientId: 'P-1046',
      doctor: 'Dr. Azimov',
      procedure: 'Implantatsiya bosqichi #1 (Straumann)',
      date: '17-Sentabr, 2026 • 16:30',
      method: 'Humo',
      amount: 4500000,
      status: 'partial'
    },
    {
      id: 'INV-2026-006',
      patient: 'Shahnoza Aliyeva',
      patientId: 'P-1047',
      doctor: 'Dr. Saidova',
      procedure: 'Zoom 4 tish oqartirish',
      date: '17-Sentabr, 2026 • 17:10',
      method: 'Payme',
      amount: 2200000,
      status: 'paid'
    },
    {
      id: 'INV-2026-007',
      patient: 'Otabek Soliyev',
      patientId: 'P-1048',
      doctor: 'Dr. Karimov',
      procedure: 'Estetik plomba #36',
      date: '16-Sentabr, 2026 • 15:00',
      method: 'Click',
      amount: 450000,
      status: 'paid'
    }
  ],
  last_month: [
    {
      id: 'INV-2026-A01',
      patient: 'Zulfiya Nazarova',
      patientId: 'P-1050',
      doctor: 'Dr. Azimov',
      procedure: 'Sirkoniy toj tayyorlash #14',
      date: '30-Avgust, 2026 • 09:00',
      method: 'Payme',
      amount: 3200000,
      status: 'paid'
    },
    {
      id: 'INV-2026-A02',
      patient: 'Bekzod Yusupov',
      patientId: 'P-1051',
      doctor: 'Dr. Saidova',
      procedure: 'Breket o\'rnatish (to\'liq kompleks)',
      date: '28-Avgust, 2026 • 11:00',
      method: 'Click',
      amount: 5800000,
      status: 'paid'
    },
    {
      id: 'INV-2026-A03',
      patient: 'Feruza Toshmatova',
      patientId: 'P-1052',
      doctor: 'Dr. Karimov',
      procedure: 'Davolash rejasi va diagnostika',
      date: '25-Avgust, 2026 • 14:30',
      method: 'Naqd',
      amount: 450000,
      status: 'pending'
    },
    {
      id: 'INV-2026-A04',
      patient: 'Ulugbek Raximov',
      patientId: 'P-1053',
      doctor: 'Dr. Azimov',
      procedure: 'OPG panoram rentgen + CBCT',
      date: '22-Avgust, 2026 • 10:15',
      method: 'Uzcard',
      amount: 280000,
      status: 'paid'
    },
    {
      id: 'INV-2026-A05',
      patient: 'Dilorom Xamrayeva',
      patientId: 'P-1054',
      doctor: 'Dr. Saidova',
      procedure: 'Professionaltozalash va ftor gel',
      date: '20-Avgust, 2026 • 16:00',
      method: 'Humo',
      amount: 350000,
      status: 'paid'
    }
  ],
  custom: [
    {
      id: 'INV-2026-C01',
      patient: 'Sarvar Holmatov',
      patientId: 'P-1060',
      doctor: 'Dr. Azimov',
      procedure: 'Karies chuqur davolash #26',
      date: '10-Sentabr, 2026 • 09:30',
      method: 'Payme',
      amount: 780000,
      status: 'paid'
    },
    {
      id: 'INV-2026-C02',
      patient: 'Mohira Isoqova',
      patientId: 'P-1061',
      doctor: 'Dr. Karimov',
      procedure: 'Tish rangi korreksiyasi',
      date: '12-Sentabr, 2026 • 13:00',
      method: 'Click',
      amount: 1200000,
      status: 'pending'
    },
    {
      id: 'INV-2026-C03',
      patient: 'Jasur Nishonov',
      patientId: 'P-1062',
      doctor: 'Dr. Saidova',
      procedure: 'Implant protezi tuzatish',
      date: '14-Sentabr, 2026 • 15:45',
      method: 'Naqd',
      amount: 2100000,
      status: 'partial'
    }
  ]
};

export const financeApi = {
  async getStats(period = 'this_month') {
    await new Promise((r) => setTimeout(r, 150));
    return { ...(STATS_BY_PERIOD[period] || STATS_BY_PERIOD.this_month) };
  },

  async getInvoices(period = 'this_month') {
    await new Promise((r) => setTimeout(r, 200));
    return [...(INVOICES_BY_PERIOD[period] || INVOICES_BY_PERIOD.this_month)];
  }
};
