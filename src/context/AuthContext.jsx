import React from 'react';
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);
const API_BASE = 'http://localhost:8080';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [role, setRole] = useState(() => localStorage.getItem('role'));

  const isAuthenticated = Boolean(token);

  const login = (newToken, userRole) => {
    localStorage.setItem('token', newToken);
    if (userRole) localStorage.setItem('role', userRole);
    setToken(newToken);
    setRole(userRole || null);
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch(API_BASE + '/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + token },
        });
      }
    } catch (err) {
    }
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    setToken(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}