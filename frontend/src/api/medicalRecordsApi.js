import apiClient from './client';

const FALLBACK_TREATMENTS = [
  {
    id: 'TR-101',
    date: '18-Sentabr, 2026',
    tooth: '#16',
    title: "Endodontik davolash (ildiz kanallarini tozalash va dorilash)",
    doctor: 'Dr. J. Azimov',
    materials: 'Septanest 1:100000, Endo-Prep, Ca(OH)2 pasta',
    price: 950000,
    status: 'completed',
    note: "3 ta ildiz kanali to'liq kengaytirildi va kalsiy gidroksidi kiritildi. Vaqtinchalik plomba qo'yildi."
  },
  {
    id: 'TR-102',
    date: '15-Sentabr, 2026',
    tooth: 'Umumiy',
    title: "3D CBCT tomografiya va diagnostik tahlil",
    doctor: 'Dr. M. Saidova',
    materials: 'Vatech PaX-i3D apparati, DICOM eksport',
    price: 350000,
    status: 'completed',
    note: "Yuqori o'ng jag' sohasida #16 tish periapikal to'qimalarida 2.4 mm destruksiya o'chog'i aniqlandi."
  },
  {
    id: 'TR-103',
    date: '02-Sentabr, 2026',
    tooth: '#14',
    title: "Yorug'likda qotuvchi estetik kompozit restavratsiya",
    doctor: 'Dr. J. Azimov',
    materials: 'Filtek Z250 (3M ESPE), A3 rang, Single Bond',
    price: 450000,
    status: 'completed',
    note: "Oklyuzion va distal yuzalar anatomik shaklda tiklandi va sayqallandi."
  },
  {
    id: 'TR-104',
    date: '15-Avgust, 2026',
    tooth: 'Umumiy',
    title: "Professional ultratovushli tozalash va Air-Flow gigiyena",
    doctor: 'Dr. M. Saidova',
    materials: 'Kavo PROPHYflex, Clinpro profilaktik pasta',
    price: 300000,
    status: 'completed',
    note: "Supragingival va subgingival tish toshlari olib tashlandi, flyuorizatsiya qilindi."
  }
];

export const medicalRecordsApi = {
  async getByPatient(patientId) {
    if (!apiClient.isMockEnabled() && patientId) {
      try {
        const res = await apiClient.get(`/medical-records?patientId=${patientId}`);
        if (res && (res.items || res.data)) {
          const list = res.items || res.data;
          if (Array.isArray(list) && list.length > 0) {
            return list.map((r) => ({
              id: r.id,
              date: r.visitDate ? new Date(r.visitDate).toLocaleDateString('uz-UZ') : 'Yaqinda',
              tooth: r.tooth || 'Umumiy',
              title: r.diagnosis || r.complaints || 'Stomatologik muolaja',
              doctor: r.doctor?.name || r.doctorName || 'Dr. J. Azimov',
              materials: r.materials || 'Standart stomatologik materiallar',
              price: r.price || 450000,
              status: r.status || 'completed',
              note: r.treatmentDone || r.recommendations || ''
            }));
          }
        }
      } catch (e) {
        console.warn('Real MedicalRecords API getByPatient failed, using fallback:', e.message);
      }
    }
    return [...FALLBACK_TREATMENTS];
  },

  async create(recordData) {
    if (!apiClient.isMockEnabled()) {
      try {
        const res = await apiClient.post('/medical-records', recordData);
        if (res && res.data) return res.data;
      } catch (e) {
        console.warn('Real MedicalRecords API create failed:', e.message);
      }
    }
    return { id: `MR-${Date.now()}`, ...recordData };
  }
};

export default medicalRecordsApi;
