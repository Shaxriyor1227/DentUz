import { apiClient } from './client';

export const notificationsApi = {
  /**
   * Get notifications for the current clinic user
   * @param {Object} params - { status, channel, limit }
   */
  getAll: async (params = {}) => {
    try {
      const query = new URLSearchParams();
      if (params.status) query.append('status', params.status);
      if (params.channel) query.append('channel', params.channel);
      if (params.limit) query.append('limit', params.limit);

      const endpoint = `/notifications${query.toString() ? `?${query.toString()}` : ''}`;
      const res = await apiClient.get(endpoint);
      return res;
    } catch (err) {
      console.warn('[notificationsApi.getAll] Failed:', err.message);
      return { success: false, data: [], unreadCount: 0 };
    }
  },

  /**
   * Mark a single notification as read
   * @param {string} id
   */
  markAsRead: async (id) => {
    try {
      return await apiClient.put(`/notifications/${id}/read`, {});
    } catch (err) {
      console.warn('[notificationsApi.markAsRead] Failed:', err.message);
      return { success: false };
    }
  },

  /**
   * Mark all notifications as read for current clinic
   */
  markAllAsRead: async () => {
    try {
      return await apiClient.put('/notifications/read-all', {});
    } catch (err) {
      console.warn('[notificationsApi.markAllAsRead] Failed:', err.message);
      return { success: false };
    }
  },

  /**
   * Delete a single notification
   * @param {string} id
   */
  delete: async (id) => {
    try {
      return await apiClient.delete(`/notifications/${id}`);
    } catch (err) {
      console.warn('[notificationsApi.delete] Failed:', err.message);
      return { success: false };
    }
  },

  /**
   * Clear all notifications for current clinic
   */
  clearAll: async () => {
    try {
      return await apiClient.delete('/notifications/clear-all');
    } catch (err) {
      console.warn('[notificationsApi.clearAll] Failed:', err.message);
      return { success: false };
    }
  }
};

export default notificationsApi;
