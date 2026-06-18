import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token
API.interceptors.request.use(
  (config) => {
    const authState = localStorage.getItem('auth-storage');
    if (authState) {
      try {
        const parsed = JSON.parse(authState);
        const token = parsed?.state?.user?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        console.error('Error parsing auth state for Axios token', err);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle expired tokens or deactivations (401 errors)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized request. Logging out user...');
      localStorage.removeItem('auth-storage');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default API;
