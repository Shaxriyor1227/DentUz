import apiClient from './client';

export const inventoryApi = {
  async getAll(params = {}) {
    if (!apiClient.isMockEnabled()) {
      try {
        const q = new URLSearchParams(params).toString();
        const res = await apiClient.get(`/inventory${q ? `?${q}` : ''}`);
        if (res && (res.items || res.data)) {
          return res.items || res.data;
        }
      } catch (e) {
        console.warn('Real Inventory API getAll failed:', e.message);
      }
    }
    return [];
  },

  async getById(id) {
    if (!apiClient.isMockEnabled()) {
      try {
        const res = await apiClient.get(`/inventory/${id}`);
        if (res && res.data) return res.data;
      } catch (e) {
        console.warn('Real Inventory API getById failed:', e.message);
      }
    }
    return null;
  },

  async create(itemData) {
    if (!apiClient.isMockEnabled()) {
      try {
        const res = await apiClient.post('/inventory', itemData);
        if (res && res.data) return res.data;
      } catch (e) {
        console.warn('Real Inventory API create failed:', e.message);
      }
    }
    return { id: `inv-${Date.now()}`, ...itemData };
  },

  async update(id, itemData) {
    if (!apiClient.isMockEnabled()) {
      try {
        const res = await apiClient.put(`/inventory/${id}`, itemData);
        if (res && res.data) return res.data;
      } catch (e) {
        console.warn('Real Inventory API update failed:', e.message);
      }
    }
    return { id, ...itemData };
  },

  async delete(id) {
    if (!apiClient.isMockEnabled()) {
      try {
        await apiClient.delete(`/inventory/${id}`);
        return { success: true };
      } catch (e) {
        console.warn('Real Inventory API delete failed:', e.message);
      }
    }
    return { success: true };
  }
};

export default inventoryApi;
