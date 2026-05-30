import axios from 'axios';
import toast from 'react-hot-toast';

// ✅ LIVE BACKEND URL (localhost hatao)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ecommerce-backend-sambhav.onrender.com';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.config.url} → ${response.status}`);
    return response;
  },
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      toast.error('Cannot connect to server');
    }
    if (error.response?.status === 401) {
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        toast.error('Session expired. Please login again.');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
