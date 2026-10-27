import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Bearer token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cc_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for unified error messaging & 401 handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If session is invalid or expired, clear and trigger soft reload if logged in
      const hasToken = localStorage.getItem('cc_token');
      if (hasToken && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('cc_token');
        localStorage.removeItem('cc_user');
      }
    }
    return Promise.reject(error.response?.data || { message: error.message });
  }
);

export default api;

