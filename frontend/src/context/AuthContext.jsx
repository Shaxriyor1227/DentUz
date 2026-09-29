import React, { createContext, useState, useEffect, useContext } from 'react';
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY } from '../api/client';

export const AuthContext = createContext(null);

export const ROLES = {
  SUPERADMIN: 'superadmin',       // Platforma egasi / SaaS Boshqaruvchi
  OWNER: 'owner',                 // Bosh shifokor / Klinika egasi (Full access)
  ADMINISTRATOR: 'administrator', // Klinika ma'muri (Operations, Staff, Patients, Finance view)
  DOCTOR: 'doctor',               // Shifokor (Clinical, Patients, Odontogram, Calendar)
  ACCOUNTANT: 'accountant',       // Buxgalter (Finance, Invoices, Payments, Inventory)
  RECEPTIONIST: 'receptionist',   // Qabulxona (Patients, Calendar)
  NURSE: 'nurse'                  // Hamshira (Patients view, Inventory)
};

export const ROLE_PERMISSIONS = {
  [ROLES.SUPERADMIN]: ['superadmin', 'dashboard', 'clinics', 'applications', 'analytics', 'settings'],
  [ROLES.OWNER]: ['dashboard', 'patients', 'calendar', 'treatment', 'finance', 'inventory', 'settings', 'analytics', 'team'],
  [ROLES.ADMINISTRATOR]: ['dashboard', 'patients', 'calendar', 'treatment', 'finance', 'inventory', 'settings', 'analytics', 'team'],
  [ROLES.DOCTOR]: ['dashboard', 'patients', 'calendar', 'treatment'],
  [ROLES.ACCOUNTANT]: ['dashboard', 'finance', 'inventory'],
  [ROLES.RECEPTIONIST]: ['dashboard', 'patients', 'calendar'],
  [ROLES.NURSE]: ['dashboard', 'patients', 'inventory']
};

export const DEMO_USERS = {
  superadmin: {
    id: 'usr-super',
    name: 'DentUz Platforma Egasi',
    shortName: 'SuperAdmin',
    title: 'DentUz Founder & SuperAdmin',
    role: ROLES.SUPERADMIN,
    email: 'superadmin@dentuz.uz',
    clinic: 'DentUz HQ (Platforma)',
    avatar: null
  },
  owner: {
    id: 'usr-1',
    name: 'Dr. Jasur Azimov',
    shortName: 'Dr. Azimov',
    title: 'Bosh shifokor & Klinika rahbari',
    role: ROLES.OWNER,
    email: 'j.azimov@dentuz.uz',
    clinic: 'DentUz Markaziy Klinika',
    avatar: null
  },
  administrator: {
    id: 'usr-admin',
    name: 'Dilshod Rahmatov',
    shortName: 'D. Rahmatov',
    title: 'Klinika Bosh Administratori',
    role: ROLES.ADMINISTRATOR,
    email: 'admin.dilshod@dentuz.uz',
    clinic: 'DentUz Markaziy Klinika',
    avatar: null
  },
  doctor: {
    id: 'usr-2',
    name: 'Dr. Malika Saidova',
    shortName: 'Dr. Saidova',
    title: 'Ortodont-Stomatolog',
    role: ROLES.DOCTOR,
    email: 'm.saidova@dentuz.uz',
    clinic: 'DentUz Markaziy Klinika',
    avatar: null
  },
  accountant: {
    id: 'usr-acc',
    name: 'Nodira Qosimova',
    shortName: 'N. Qosimova',
    title: 'Bosh Buxgalter',
    role: ROLES.ACCOUNTANT,
    email: 'accountant@dentuz.uz',
    clinic: 'DentUz Markaziy Klinika',
    avatar: null
  },
  receptionist: {
    id: 'usr-3',
    name: 'Bobur Mirzayev',
    shortName: 'B. Mirzayev',
    title: 'Qabulxona Administratori',
    role: ROLES.RECEPTIONIST,
    email: 'admin@dentuz.uz',
    clinic: 'DentUz Markaziy Klinika',
    avatar: null
  },
  nurse: {
    id: 'usr-4',
    name: 'Nilufar Rahimova',
    shortName: 'N. Rahimova',
    title: 'Bosh assistent • Hamshira',
    role: ROLES.NURSE,
    email: 'n.rahimova@dentuz.uz',
    clinic: 'DentUz Markaziy Klinika',
    avatar: null
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY) || 'demo_mock_jwt_token');

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.clinic === 'Toshkent Dental Clinic' || !parsed.clinic) {
          parsed.clinic = 'DentUz Markaziy Klinika';
        }
        return parsed;
      }
      return DEMO_USERS.owner;
    } catch {
      return DEMO_USERS.owner;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(user));

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
      setIsAuthenticated(false);
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, [token]);

  // Listen for global 401 unauthorized event from apiClient
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('dentuz:auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('dentuz:auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (credentials, passwordParam, role = ROLES.OWNER) => {
    const identifier = (typeof credentials === 'object' ? (credentials?.login || credentials?.username || credentials?.email) : credentials) || '';
    const password = (typeof credentials === 'object' && credentials?.password) ? credentials.password : (passwordParam || 'Password123!');
    const targetRole = (typeof credentials === 'object' && credentials?.role) ? credentials.role : role;

    // 1. Try real backend authentication
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email: identifier?.trim(), login: identifier?.trim(), password })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.token) {
          const userPayload = {
            id: data.data?.id || data.user?.id || 'usr-real',
            name: data.data?.name || data.user?.name || identifier,
            username: data.data?.username || data.user?.username || null,
            shortName: data.data?.shortName || data.user?.shortName || data.data?.name || 'Foydalanuvchi',
            title: data.data?.title || data.user?.title || 'Stomatolog',
            role: data.data?.role || data.user?.role || ROLES.OWNER,
            email: data.data?.email || data.user?.email || identifier,
            clinic: data.data?.clinic?.name || data.user?.clinic?.name || 'DentUz Markaziy Klinika',
            phone: data.data?.phone || data.user?.phone || '',
            avatar: data.data?.avatarUrl || data.user?.avatarUrl || null
          };

          setToken(data.token);
          if (data.refreshToken) {
            localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, data.refreshToken);
          }
          setUser(userPayload);
          setIsAuthenticated(true);
          return { success: true, data: userPayload };
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        return {
          success: false,
          message: errData.message || 'Login yoki parol noto\'g\'ri'
        };
      }
    } catch (err) {
      console.warn('Real backend auth not reachable:', err.message);
      return {
        success: false,
        message: 'Serverga ulanib bo\'lmadi. Internet yoki backend ishlayotganini tekshiring.'
      };
    }
    return { success: false, message: 'Autentifikatsiya amalga oshmadi' };
  };

  const switchRole = (roleKey) => {
    if (DEMO_USERS[roleKey]) {
      setUser(DEMO_USERS[roleKey]);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  };

  /**
   * Check if the current user has permission to access a specific module
   */
  const canAccess = (moduleKey) => {
    if (!user || !user.role) return false;
    const permissions = ROLE_PERMISSIONS[user.role] || [];
    return permissions.includes(moduleKey);
  };

  /**
   * Check if the current user has one of the allowed roles
   */
  const hasRole = (allowedRoles = []) => {
    if (!user || !user.role) return false;
    if (typeof allowedRoles === 'string') return user.role === allowedRoles;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        login,
        logout,
        setUser,
        switchRole,
        canAccess,
        hasRole,
        ROLES,
        DEMO_USERS
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
