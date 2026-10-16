const rawApiUrl = import.meta.env.VITE_API_URL;
const isProd = import.meta.env.PROD;

if (isProd && !rawApiUrl) {
  console.error("🚨 DIQQAT: Production muhitida 'VITE_API_URL' o'zgaruvchisi kiritilmagan!");
}

if (isProd && import.meta.env.VITE_USE_MOCK === 'true') {
  console.error("🚨 DIQQAT: Production muhitida 'VITE_USE_MOCK=true' bo'lishi mumkin emas!");
}

// In development fallback to local API server, remove hardcoded onrender URL
const BASE_URL = rawApiUrl || 'http://localhost:5000/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const TOKEN_STORAGE_KEY = 'dentuz_auth_token';
export const REFRESH_TOKEN_STORAGE_KEY = 'dentuz_refresh_token';
export const USER_STORAGE_KEY = 'dentuz_auth_user';

export class ApiError extends Error {
  constructor(message, status = 500, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Global in-flight requests tracking for Render Cold-Start UX (> 3 seconds)
let activeRequestsCount = 0;
let slowTimer = null;

function onRequestStart() {
  activeRequestsCount++;
  if (!slowTimer) {
    slowTimer = setTimeout(() => {
      if (activeRequestsCount > 0) {
        window.dispatchEvent(new CustomEvent('dentuz:server:slow', { detail: { isSlow: true } }));
      }
    }, 3000);
  }
}

function onRequestEnd() {
  activeRequestsCount = Math.max(0, activeRequestsCount - 1);
  if (activeRequestsCount === 0) {
    if (slowTimer) {
      clearTimeout(slowTimer);
      slowTimer = null;
    }
    window.dispatchEvent(new CustomEvent('dentuz:server:slow', { detail: { isSlow: false } }));
  }
}

let refreshPromise = null;

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (data && data.success && data.token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      if (data.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, data.refreshToken);
      }
      return data.token;
    }
    return null;
  } catch {
    return null;
  }
}

async function request(endpoint, options = {}, attempt = 0) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  const method = (options.method || 'GET').toUpperCase();
  const isIdempotent = method === 'GET' || method === 'HEAD' || method === 'OPTIONS';

  const lang = (typeof window !== 'undefined' && localStorage.getItem('dentuz_lang')) || 'uz';
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Accept-Language': lang,
    ...(options.headers || {}),
  };

  // Attach JWT Token if available
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    method,
    headers,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  // AbortController for cold-start timeout (45 seconds for Render server spin-up)
  const controller = new AbortController();
  const timeoutMs = options.timeout || 45000;
  const timeoutTimer = setTimeout(() => controller.abort(), timeoutMs);
  config.signal = controller.signal;

  onRequestStart();

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutTimer);

    // If server is returning Render Cold Start / Gateway errors (502, 503, 504) on idempotent requests:
    // Retry up to 2 times with a slight delay
    if (isIdempotent && [502, 503, 504].includes(response.status) && attempt < 2) {
      onRequestEnd();
      await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1)));
      return request(endpoint, options, attempt + 1);
    }

    // Handle 401 Unauthorized (Expired or invalid token)
    if (response.status === 401) {
      const isAuthUrl = endpoint.includes('/auth/login') || endpoint.includes('/auth/refresh');
      if (!options._isRetry && !isAuthUrl) {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }
        const newToken = await refreshPromise;
        if (newToken) {
          const retryHeaders = {
            ...headers,
            'Authorization': `Bearer ${newToken}`,
          };
          onRequestEnd();
          return await request(endpoint, {
            ...options,
            _isRetry: true,
            headers: retryHeaders,
          });
        }
      }

      // Refresh failed or already retried
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('dentuz:auth:unauthorized'));
      throw new ApiError('Sessiya muddati tugadi. Iltimos, qaytadan kiring.', 401);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      onRequestEnd();
      return { success: true };
    }

    const contentType = response.headers.get('content-type');
    const data = contentType && contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    onRequestEnd();

    if (!response.ok) {
      const errorMessage = typeof data === 'object' && data?.message
        ? data.message
        : `Server xatoligi: ${response.status} ${response.statusText}`;
      const err = new ApiError(errorMessage, response.status, data);
      if (typeof data === 'object' && data?.code) {
        err.code = data.code;
      }
      throw err;
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutTimer);
    onRequestEnd();

    if (err instanceof ApiError) {
      throw err;
    }

    // If idempotent request experienced network failure (or cold start connection drop), retry up to 2 times
    if (isIdempotent && attempt < 2 && (err.name === 'AbortError' || err.name === 'TypeError')) {
      await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1)));
      return request(endpoint, options, attempt + 1);
    }

    // Final connection failure
    throw new ApiError(
      "Serverga ulanib bo'lmadi. Internet aloqasini tekshiring yoki server uyg'onishini kuting.",
      0,
      { originalError: err.message }
    );
  }
}

export const apiClient = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options) => request(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options) => request(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
  isMockEnabled: () => USE_MOCK,
  getBaseUrl: () => BASE_URL,
  /**
   * Pings /api/health to warm up the Render free-tier container upon entering login/signup
   */
  warmUpServer: async () => {
    try {
      const healthUrl = BASE_URL.replace(/\/api\/?$/, '') + '/api/health';
      await fetch(healthUrl, { method: 'GET', mode: 'cors', cache: 'no-store' });
    } catch {}
  },
};

export default apiClient;
