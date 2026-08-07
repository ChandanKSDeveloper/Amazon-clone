import axios from 'axios';


// ─── Server URL Config ───────────────────────────────────────────────────────
// Add or change URLs here to support additional environments.
// The active URL is controlled by VITE_API_URL in your .env file:
//   - Development : frontend/.env              → http://localhost:4000/api/v1
//   - Production  : frontend/.env.production   → https://your-production-api.com/api/v1
const SERVER_URLS = {
    dev: "http://localhost:4000/api/v1",
    prod: "https://your-production-api.com/api/v1", // deployed url
};

const envApiUrl = import.meta.env.VITE_API_URL?.trim();
const API_BASE_URL = envApiUrl
    ? envApiUrl.replace(/\/$/, "")       // use .env value (dev or prod)
    : SERVER_URLS.dev;                   // safe fallback to local backend

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
    'Content-Type': 'application/json'
  }
});


// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear local storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user-storage');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;