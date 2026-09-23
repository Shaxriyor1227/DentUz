import React, { createContext, useState, useEffect, useContext } from 'react';
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../api/client';

export const AuthContext = createContext(null);

export const ROLES = {
  OWNER: 'owner',         // Bosh shifokor / Klinika egasi (Full access)
  DOCTOR: 'doctor',       // Shifokor (Clinical, Patients, Odontogram, Calendar)
  RECEPTIONIST: 'receptionist', // Administrator (Patients, Calendar, Finance, Billing)
  NURSE: 'nurse'          // Hamshira (Patients view, Inventory)
};

export const ROLE_PERMISSIONS = {
  [ROLES.OWNER]: ['dashboard', 'patients', 'calendar', 'treatment', 'finance', 'inventory', 'settings', 'analytics', 'team'],
  [ROLES.DOCTOR]: ['dashboard', 'patients', 'calendar', 'treatment'],
  [ROLES.RECEPTIONIST]: ['dashboard', 'patients', 'calendar', 'finance', 'settings'],
  [ROLES.NURSE]: ['dashboard', 'patients', 'inventory']
};

export const DEMO_USERS = {
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
  receptionist: {
    id: 'usr-3',
    name: 'Bobur Mirzayev',
    shortName: 'B. Mirzayev',
    title: 'Bosh Administrator',
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
    const email = (typeof credentials === 'object' && credentials?.email) ? credentials.email : credentials;
    const password = (typeof credentials === 'object' && credentials?.password) ? credentials.password : (passwordParam || 'Password123!');
    const targetRole = (typeof credentials === 'object' && credentials?.role) ? credentials.role : role;

    // 1. Try real backend authentication
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email: email?.trim(), password })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.token) {
          const userPayload = {
            id: data.data?.id || 'usr-real',
            name: data.data?.name || data.data?.shortName || email,
            shortName: data.data?.shortName || data.data?.name || 'Foydalanuvchi',
            title: data.data?.title || 'Stomatolog',
            role: data.data?.role || ROLES.OWNER,
            email: data.data?.email || email,
            clinic: data.data?.clinic?.name || data.data?.clinic || 'DentUz Markaziy Klinika',
            phone: data.data?.phone || '',
            avatar: data.data?.avatarUrl || null
          };

          setToken(data.token);
          setUser(userPayload);
          setIsAuthenticated(true);
          return { success: true, data: userPayload };
        }
      }
    } catch (err) {
      console.warn('Real backend auth not reachable, applying local fallback:', err.message);
    }

    // 2. Graceful fallback for offline demo or standalone frontend mode
    const matchedUser = Object.values(DEMO_USERS).find((u) => u.email === email) || {
      ...(DEMO_USERS[targetRole] || DEMO_USERS.owner),
      email: email || DEMO_USERS.owner.email,
      name: (typeof credentials === 'object' && credentials?.name) || DEMO_USERS.owner.name,
      clinic: (typeof credentials === 'object' && credentials?.clinic) || DEMO_USERS.owner.clinic
    };

    const mockJwt = `jwt_${Date.now()}_${btoa(email || 'user')}`;
    setToken(mockJwt);
    setUser(matchedUser);
    setIsAuthenticated(true);
    return { success: true, data: matchedUser };
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
