import React from 'react';
import { createContext, useContext, useState, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-hot-toast';
import { API_BASE } from '../utils/api';

const AuthContext = createContext(null);

function decodeToken(token) {
  try {
    const payload = jwtDecode(token);
    return {
      userId: payload.userId ?? null,
      role: payload.role ?? null,
      username: payload.username ?? '',
      email: payload.email ?? payload.sub ?? '',
    };
  } catch {
    return { userId: null, role: null, username: '', email: '' };
  }
}

function getStoredToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token') || null;
}

function isTokenExpired(token) {
  try {
    const { exp } = jwtDecode(token);
    return !exp || Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const stored = getStoredToken();
    if (stored && !isTokenExpired(stored)) return stored;
    // Clear expired token
    if (stored) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
    }
    return null;
  });

  const decoded = token ? decodeToken(token) : { userId: null, role: null, username: '', email: '' };

  const [userId, setUserId] = useState(decoded.userId);
  const [role, setRole] = useState(decoded.role);
  const [username, setUsername] = useState(decoded.username);
  const [email, setEmail] = useState(decoded.email);

  const isAuthenticated = Boolean(token);

  const login = useCallback((newToken, rememberMe = false) => {
    if (!newToken) return;

    const storage = rememberMe ? localStorage : sessionStorage;
    const otherStorage = rememberMe ? sessionStorage : localStorage;

    // Store only the token
    storage.setItem('token', newToken);

    // Remove token from the other storage
    otherStorage.removeItem('token');

    // Decode and set state
    const payload = decodeToken(newToken);
    setToken(newToken);
    setUserId(payload.userId);
    setRole(payload.role);
    setUsername(payload.username);
    setEmail(payload.email);

    toast.success('Login successful');
  }, []);

  const logout = useCallback(async () => {
    // Call server-side logout
    try {
      if (token) {
        await fetch(API_BASE + '/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + token },
        });
      }
    } catch (err) { /* ignore network errors on logout */ }

    // Clear token from both storages
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');

    // Clear residual keys from old storage patterns
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('username');

    // Reset state
    setToken(null);
    setUserId(null);
    setRole(null);
    setUsername('');
    setEmail('');

    toast.success('Logout successful');
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, role, userId, username, email, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
