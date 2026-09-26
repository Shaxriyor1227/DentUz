import apiClient from './client';

const DEFAULT_PROCEDURES = [
  {
    step: '01',
    title: "Dastlabki ko'rik va 3D CBCT tomografiya",
    desc: "Diagnostik rentgen tahlili, panoramik o'lchov va 3D suyak zichligi bahosi",
    tooth: 'Umumiy',
    date: '18-Sentabr, 2026',
    price: 350000,
    status: 'completed'
  },
  {
    step: '02',
    title: '#16 tish endodontik davolash (kanal tozalash va dorilash)',
    desc: 'Kanal ichi nekrotik to\'qimalarni tozalash, antiseptik ishlov va kalsiy pastasini kiritish',
    tooth: '#16',
    date: '18-Sentabr, 2026',
    price: 950000,
    status: 'completed'
  },
  {
    step: '03',
    title: '#14 tish kompozit restavratsiya',
    desc: "Yorug'likda qotuvchi estetik restavratsiya (Filtek Z250) anatomiya tiklanishi",
    tooth: '#14',
    date: '19-Sentabr, 2026',
    price: 450000,
    status: 'completed'
  },
  {
    step: '04',
    title: '#16 tishni doimiy obturatsiya qilish (Guttapercha)',
    desc: 'Ildiz kanal tizimini issiq guttapercha usulida doimiy zich plombalash',
    tooth: '#16',
    date: '22-Sentabr, 2026',
    price: 600000,
    status: 'in_progress'
  },
  {
    step: '05',
    title: '#16 tish uchun sirkoniy toj tayyorlash va o\'rnatish',
    desc: 'CAD/CAM texnologiyasi asosida sirkoniy oksid asosli toj tayyorlash va fiksatsiyasi',
    tooth: '#16',
    date: '25-Sentabr, 2026',
    price: 2400000,
    status: 'scheduled'
  },
  {
    step: '06',
    title: '#36 tish kariesini davolash va estetik plomba',
    desc: 'Fissura kariesini tozalash, adgeziv protokol va kompozit restavratsiya',
    tooth: '#36',
    date: '29-Sentabr, 2026',
    price: 450000,
    status: 'scheduled'
  }
];

export const treatmentPlanApi = {
  async getAll(params = {}) {
    if (!apiClient.isMockEnabled()) {
      try {
        const q = new URLSearchParams(params).toString();
        const res = await apiClient.get(`/treatment-plans${q ? `?${q}` : ''}`);
        if (res && (res.items || res.data)) {
          return res.items || res.data;
        }
      } catch (e) {
        console.warn('Real TreatmentPlan API getAll failed, using fallback:', e.message);
      }
    }
    return [];
  },

  async getById(id) {
    if (!apiClient.isMockEnabled()) {
      try {
        const res = await apiClient.get(`/treatment-plans/${id}`);
        if (res && res.data) return res.data;
      } catch (e) {
        console.warn('Real TreatmentPlan API getById failed:', e.message);
      }
    }
    return null;
  },

  async create(planData) {
    if (!apiClient.isMockEnabled()) {
      try {
        const res = await apiClient.post('/treatment-plans', planData);
        if (res && res.data) return res.data;
      } catch (e) {
        console.warn('Real TreatmentPlan API create failed:', e.message);
      }
    }
    return { id: `TP-${Date.now()}`, ...planData };
  },

  async update(id, planData) {
    if (!apiClient.isMockEnabled()) {
      try {
        const res = await apiClient.put(`/treatment-plans/${id}`, planData);
        if (res && res.data) return res.data;
      } catch (e) {
        console.warn('Real TreatmentPlan API update failed:', e.message);
      }
    }
    return { id, ...planData };
  },

  getDefaultProcedures() {
    return [...DEFAULT_PROCEDURES];
  }
};

export default treatmentPlanApi;
