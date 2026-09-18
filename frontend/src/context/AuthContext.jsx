import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

const DEFAULT_USER = {
  id: 'usr-1',
  name: 'Dr. Jasur Azimov',
  shortName: 'Dr. Azimov',
  title: 'Bosh shifokor',
  role: 'owner',
  email: 'j.azimov@dentuz.uz',
  clinic: 'Toshkent Dental Clinic'
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('dentuz_auth_user');
      return saved ? JSON.parse(saved) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    if (user) {
      localStorage.setItem('dentuz_auth_user', JSON.stringify(user));
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('dentuz_auth_user');
      setIsAuthenticated(false);
    }
  }, [user]);

  const login = (email, password) => {
    const loggedUser = {
      ...DEFAULT_USER,
      email: email || DEFAULT_USER.email
    };
    setUser(loggedUser);
    setIsAuthenticated(true);
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
