import { jwtDecode } from 'jwt-decode';

// Shared auth helpers. Only the JWT token is stored in browser storage
// (localStorage for persistent sessions, sessionStorage for temporary ones).
// userId, role, username, and email are decoded from the token at runtime.

export const getStoredToken = () =>
  localStorage.getItem('token') || sessionStorage.getItem('token') || null;

export const getStoredRole = () => {
  const token = getStoredToken();
  if (!token) return null;
  try {
    const payload = jwtDecode(token);
    return payload.role || null;
  } catch {
    return null;
  }
};

export const getStoredUserId = () => {
  const token = getStoredToken();
  if (!token) return null;
  try {
    const payload = jwtDecode(token);
    return payload.userId || null;
  } catch {
    return null;
  }
};

export const getStoredUsername = () => {
  const token = getStoredToken();
  if (!token) return '';
  try {
    const payload = jwtDecode(token);
    return payload.username || '';
  } catch {
    return '';
  }
};
