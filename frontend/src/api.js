// api.js – axios instance that:
//   1. Reads VITE_API_URL from env (or falls back to /api for the Vite proxy)
//   2. Attaches JWT from localStorage to every request
//   3. Auto-logs-out on 401 (token expired or invalid)
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Request interceptor – attach the token on every call
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor – clear auth and reload on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Hard reload sends user to login via ProtectedRoute
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
