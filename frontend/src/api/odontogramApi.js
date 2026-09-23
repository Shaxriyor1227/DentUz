/**
 * Mock Odontogram API for FDI Dental Charting
 */

const toothNames = {
  18: "Uchinchi yuqori o'ng aql tishi (Molar 3)",
  17: "Ikkinchi yuqori o'ng oziq tish (Molar 2)",
  16: "Birinchi yuqori o'ng oziq tish (Molar 1)",
  15: "Ikkinchi yuqori o'ng kichik oziq (Premolar 2)",
  14: "Birinchi yuqori o'ng kichik oziq (Premolar 1)",
  13: "Yuqori o'ng qoziq tish (Canine)",
  12: "Yuqori o'ng lateral kurak tish (Incisor 2)",
  11: "Markaziy yuqori o'ng kurak tish (Incisor 1)",
  21: "Markaziy yuqori chap kurak tish (Incisor 1)",
  22: "Yuqori chap lateral kurak tish (Incisor 2)",
  23: "Yuqori chap qoziq tish (Canine)",
  24: "Birinchi yuqori chap kichik oziq (Premolar 1)",
  25: "Ikkinchi yuqori chap kichik oziq (Premolar 2)",
  26: "Birinchi yuqori chap oziq tish (Molar 1)",
  27: "Ikkinchi yuqori chap oziq tish (Molar 2)",
  28: "Uchinchi yuqori chap aql tishi (Molar 3)",
  48: "Uchinchi pastki o'ng aql tishi (Molar 3)",
  47: "Ikkinchi pastki o'ng oziq tish (Molar 2)",
  46: "Birinchi pastki o'ng oziq tish (Molar 1)",
  45: "Ikkinchi pastki o'ng kichik oziq (Premolar 2)",
  44: "Birinchi pastki o'ng kichik oziq (Premolar 1)",
  43: "Pastki o'ng qoziq tish (Canine)",
  42: "Pastki o'ng lateral kurak tish (Incisor 2)",
  41: "Markaziy pastki o'ng kurak tish (Incisor 1)",
  31: "Markaziy pastki chap kurak tish (Incisor 1)",
  32: "Pastki chap lateral kurak tish (Incisor 2)",
  33: "Pastki chap qoziq tish (Canine)",
  34: "Birinchi pastki chap kichik oziq (Premolar 1)",
  35: "Ikkinchi pastki chap kichik oziq (Premolar 2)",
  36: "Birinchi pastki chap oziq tish (Molar 1)",
  37: "Ikkinchi pastki chap oziq tish (Molar 2)",
  38: "Uchinchi pastki chap aql tishi (Molar 3)"
};

// Initial state matching Stitch design
const initialChart = {};
const allToothIds = [
  18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
  48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38
];

allToothIds.forEach((id) => {
  initialChart[id] = {
    id: String(id),
    name: toothNames[id] || `${id}-tish`,
    status: 'healthy', // healthy, caries, treated, crown, missing
    diagnosis: 'Patologiyasiz, normada',
    plan: 'Profilaktik kuzatuv',
    surfaces: {
      occlusal: 'healthy',
      mesial: 'healthy',
      distal: 'healthy',
      buccal: 'healthy',
      lingual: 'healthy'
    },
    history: [
      {
        date: '14-Fevral, 2023',
        doctor: 'Dr. Saidova',
        note: 'Profilaktik ultratovushli tozalash va flyuorizatsiya.'
      }
    ]
  };
});

// Seed specific teeth from Stitch
initialChart['16'] = {
  id: '16',
  name: toothNames[16],
  status: 'caries',
  diagnosis: 'Emal va dentin qatlami zararlangan. Termik sezuvchanlik mavjud.',
  plan: 'Ildiz kanalini tozalash (Endodontiya) va sirkoniy toj tavsiya etiladi.',
  surfaces: {
    occlusal: 'caries',
    mesial: 'caries',
    distal: 'healthy',
    buccal: 'healthy',
    lingual: 'healthy'
  },
  history: [
    {
      date: '18-Sentabr, 2026',
      doctor: 'Dr. Azimov',
      note: "Dastlabki ko'rik, rentgenodiagnostika va termo-test o'tkazildi."
    },
    {
      date: '14-Fevral, 2023',
      doctor: 'Dr. Saidova',
      note: 'Profilaktik ultratovushli tozalash va flyuorizatsiya.'
    }
  ]
};

initialChart['14'] = {
  id: '14',
  name: toothNames[14],
  status: 'treated',
  diagnosis: "Yorug'likda qotuvchi kompozit plomba o'rnatilgan. Birlamchi holati barqaror.",
  plan: "Profilaktik ko'rik",
  surfaces: {
    occlusal: 'treated',
    mesial: 'healthy',
    distal: 'healthy',
    buccal: 'healthy',
    lingual: 'healthy'
  },
  history: [
    {
      date: '12-Avgust, 2023',
      doctor: 'Dr. Azimov',
      note: "Kompozit plomba o'rnatildi (Filtek Z250)."
    }
  ]
};

initialChart['21'] = {
  id: '21',
  name: toothNames[21],
  status: 'crown',
  diagnosis: "Metall-keramika toj o'rnatilgan. Marginal birikish zich.",
  plan: 'Holati qoniqarli',
  surfaces: {
    occlusal: 'crown',
    mesial: 'crown',
    distal: 'crown',
    buccal: 'crown',
    lingual: 'crown'
  },
  history: [
    {
      date: '10-Sentabr, 2022',
      doctor: 'Dr. Azimov',
      note: "Metall-keramika toj fiksatsiyasi (Fuji I)."
    }
  ]
};

initialChart['48'] = {
  id: '48',
  name: toothNames[48],
  status: 'missing',
  diagnosis: 'Retensiyalangan, yarim yorib chiqqan holatda',
  plan: "Rikestomiyaga (ekstraktsiyaga) tayyorgarlik",
  surfaces: {
    occlusal: 'missing',
    mesial: 'missing',
    distal: 'missing',
    buccal: 'missing',
    lingual: 'missing'
  },
  history: []
};

initialChart['47'] = {
  id: '47',
  name: toothNames[47],
  status: 'treated',
  diagnosis: "Kompozit plomba o'rnatilgan.",
  plan: 'Normada',
  surfaces: {
    occlusal: 'treated',
    mesial: 'healthy',
    distal: 'healthy',
    buccal: 'healthy',
    lingual: 'healthy'
  },
  history: []
};

initialChart['46'] = {
  id: '46',
  name: toothNames[46],
  status: 'treated',
  diagnosis: 'Kompozit restavratsiya 2022-yilda amalga oshirilgan.',
  plan: 'Muntazam nazorat',
  surfaces: {
    occlusal: 'treated',
    mesial: 'treated',
    distal: 'healthy',
    buccal: 'healthy',
    lingual: 'healthy'
  },
  history: []
};

initialChart['36'] = {
  id: '36',
  name: toothNames[36],
  status: 'caries',
  diagnosis: "Fissura kariesi aniqlangan. Sezuvchanlik o'rtacha.",
  plan: 'Plomba (kompozit)',
  surfaces: {
    occlusal: 'caries',
    mesial: 'healthy',
    distal: 'healthy',
    buccal: 'healthy',
    lingual: 'healthy'
  },
  history: [
    {
      date: '18-Sentabr, 2026',
      doctor: 'Dr. Azimov',
      note: "Karies tashxisi qo'yildi."
    }
  ]
};

let userChart = { ...initialChart };

import apiClient from './client';

export const odontogramApi = {
  async getChart(patientId = 'P-1042') {
    if (!apiClient.isMockEnabled()) {
      try {
        const res = await apiClient.get(`/odontogram/${patientId}`);
        if (res && res.data && res.data.teeth && Object.keys(res.data.teeth).length > 0) {
          const merged = { ...userChart };
          Object.keys(res.data.teeth).forEach((tid) => {
            if (merged[tid]) {
              merged[tid] = { ...merged[tid], ...res.data.teeth[tid] };
            }
          });
          return merged;
        }
      } catch (e) {
        console.warn('Real Odontogram API getChart failed, fallback to local data:', e.message);
      }
    }
    await new Promise((r) => setTimeout(r, 120));
    return { ...userChart };
  },

  async updateTooth(toothId, updates, patientId = 'P-1042') {
    if (!apiClient.isMockEnabled()) {
      try {
        const current = userChart[toothId] || {};
        const newTeeth = {
          [toothId]: {
            ...current,
            ...updates,
          },
        };
        await apiClient.put(`/odontogram/${patientId}`, {
          teeth: newTeeth,
          changedTooth: parseInt(toothId, 10) || null,
          newCondition: updates.status || null,
          notes: updates.note || null,
        });
      } catch (e) {
        console.warn('Real Odontogram API updateTooth failed:', e.message);
      }
    }
    await new Promise((r) => setTimeout(r, 200));
    const current = userChart[toothId] || {};
    userChart[toothId] = {
      ...current,
      ...updates,
      history: updates.note
        ? [
            {
              date: 'Bugun, ' + new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
              doctor: 'Dr. Azimov',
              note: updates.note
            },
            ...(current.history || [])
          ]
        : current.history
    };
    return { ...userChart[toothId] };
  }
};
