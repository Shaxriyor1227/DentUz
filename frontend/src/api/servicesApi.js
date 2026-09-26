import apiClient from './client';

const FALLBACK_SERVICES = [
  { id: 'srv-1', category: 'Diagnostika', name: 'Dastlabki konsultatsiya', duration: 30, price: 50000 },
  { id: 'srv-2', category: 'Diagnostika', name: 'Panoramik rentgen', duration: 15, price: 120000 },
  { id: 'srv-3', category: 'Davolash', name: 'Karies davolash (1 sirt)', duration: 60, price: 250000 },
  { id: 'srv-4', category: 'Davolash', name: 'Karies davolash (2 sirt)', duration: 90, price: 380000 },
  { id: 'srv-5', category: 'Jarrohlik', name: 'Tish chiqarish (oddiy)', duration: 30, price: 180000 },
  { id: 'srv-6', category: 'Jarrohlik', name: 'Murakkab chiqarish', duration: 60, price: 350000 },
  { id: 'srv-7', category: 'Estetika', name: 'Professional tozalash (Air-Flow)', duration: 60, price: 300000 },
  { id: 'srv-8', category: 'Estetika', name: 'Oqartirish (Zoom)', duration: 120, price: 1800000 },
  { id: 'srv-9', category: 'Protezlash', name: 'Metall-keramika toj', duration: 45, price: 1200000 },
  { id: 'srv-10', category: 'Protezlash', name: 'Zirkoniy toj', duration: 45, price: 2500000 },
];

export const servicesApi = {
  async getAll(params = {}) {
    if (!apiClient.isMockEnabled()) {
      try {
        const q = new URLSearchParams(params).toString();
        const res = await apiClient.get(`/services${q ? `?${q}` : ''}`);
        if (res && (res.items || res.data)) {
          const list = res.items || res.data;
          if (Array.isArray(list) && list.length > 0) {
            return list.map((s) => ({
              id: s.id,
              name: s.name,
              category: s.category || 'Davolash',
              price: Number(s.price) || 0,
              duration: s.duration || s.durationMinutes || 45,
              description: s.description || '',
              isActive: s.isActive !== false
            }));
          }
        }
      } catch (e) {
        console.warn('Real Services API getAll failed, using fallback:', e.message);
      }
    }
    return [...FALLBACK_SERVICES];
  },

  async create(serviceData) {
    if (!apiClient.isMockEnabled()) {
      try {
        const res = await apiClient.post('/services', serviceData);
        if (res && res.data) return res.data;
      } catch (e) {
        console.warn('Real Services API create failed:', e.message);
      }
    }
    return { id: `srv-${Date.now()}`, ...serviceData };
  },

  async update(id, serviceData) {
    if (!apiClient.isMockEnabled()) {
      try {
        const res = await apiClient.put(`/services/${id}`, serviceData);
        if (res && res.data) return res.data;
      } catch (e) {
        console.warn('Real Services API update failed:', e.message);
      }
    }
    return { id, ...serviceData };
  },

  async delete(id) {
    if (!apiClient.isMockEnabled()) {
      try {
        await apiClient.delete(`/services/${id}`);
        return { success: true };
      } catch (e) {
        console.warn('Real Services API delete failed:', e.message);
      }
    }
    return { success: true };
  }
};

export default servicesApi;
