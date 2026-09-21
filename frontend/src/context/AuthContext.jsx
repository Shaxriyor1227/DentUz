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
    clinic: 'Toshkent Dental Clinic',
    avatar: null
  },
  doctor: {
    id: 'usr-2',
    name: 'Dr. Madina Rustamova',
    shortName: 'Dr. Rustamova',
    title: 'Ortodont-Stomatolog',
    role: ROLES.DOCTOR,
    email: 'm.rustamova@dentuz.uz',
    clinic: 'Toshkent Dental Clinic',
    avatar: null
  },
  receptionist: {
    id: 'usr-3',
    name: 'Ziyoda Karimova',
    shortName: 'Ziyoda K.',
    title: 'Bosh Administrator',
    role: ROLES.RECEPTIONIST,
    email: 'reception@dentuz.uz',
    clinic: 'Toshkent Dental Clinic',
    avatar: null
  },
  nurse: {
    id: 'usr-4',
    name: 'Shahlo Qosimova',
    shortName: 'Shahlo Q.',
    title: 'Katta hamshira',
    role: ROLES.NURSE,
    email: 'nurse@dentuz.uz',
    clinic: 'Toshkent Dental Clinic',
    avatar: null
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY) || 'demo_mock_jwt_token');

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEMO_USERS.owner;
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

  const login = (email, password, role = ROLES.OWNER) => {
    const matchedUser = Object.values(DEMO_USERS).find(u => u.email === email) || {
      ...DEMO_USERS[role] || DEMO_USERS.owner,
      email: email || DEMO_USERS.owner.email
    };
    
    const mockJwt = `jwt_${Date.now()}_${btoa(email || 'user')}`;
    setToken(mockJwt);
    setUser(matchedUser);
    setIsAuthenticated(true);
    return true;
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
