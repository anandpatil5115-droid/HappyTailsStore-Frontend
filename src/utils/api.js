// Centralized API base URL.
// Uses the VITE_API_BASE_URL env var (set in Vercel for production,
// .env / .env.local for local dev) and falls back to localhost for convenience.
export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
