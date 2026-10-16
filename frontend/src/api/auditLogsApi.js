import apiClient from './client';

export const auditLogsApi = {
  async getAuditLogs(params = {}) {
    if (!apiClient.isMockEnabled()) {
      try {
        const query = new URLSearchParams();
        if (params.page) query.set('page', params.page);
        if (params.limit) query.set('limit', params.limit);
        if (params.action) query.set('action', params.action);
        if (params.resource) query.set('resource', params.resource);
        if (params.search) query.set('search', params.search);
        if (params.startDate) query.set('startDate', params.startDate);
        if (params.endDate) query.set('endDate', params.endDate);

        const qs = query.toString();
        const url = `/audit-logs${qs ? `?${qs}` : ''}`;
        const res = await apiClient.get(url);
        if (res && res.data) return res;
      } catch (err) {
        if (err?.status === 401 || err?.status === 403) throw err;
        console.warn('Real audit-logs API failed, fallback to mock data:', err.message);
      }
    }

    await new Promise((r) => setTimeout(r, 150));
    return {
      success: true,
      totalItems: 4,
      totalPages: 1,
      currentPage: 1,
      data: [
        {
          id: 'log-1',
          userEmail: 'j.azimov@dentuz.uz',
          userRole: 'owner',
          action: 'AUTH_LOGIN',
          resource: 'Auth',
          resourceId: null,
          ip: '127.0.0.1',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'log-2',
          userEmail: 'j.azimov@dentuz.uz',
          userRole: 'owner',
          action: 'STAFF_PASSWORD_RESET',
          resource: 'User',
          resourceId: 'usr-2',
          ip: '127.0.0.1',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'log-3',
          userEmail: 'm.saidova@dentuz.uz',
          userRole: 'doctor',
          action: 'PATIENT_CREATE',
          resource: 'Patient',
          resourceId: 'pat-104',
          ip: '192.168.1.15',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: 'log-4',
          userEmail: 'sh.aliyeva@dentuz.uz',
          userRole: 'receptionist',
          action: 'PAYMENT_RECORD',
          resource: 'Payment',
          resourceId: 'pay-802',
          ip: '192.168.1.20',
          createdAt: new Date(Date.now() - 14400000).toISOString(),
        },
      ],
    };
  },
};
