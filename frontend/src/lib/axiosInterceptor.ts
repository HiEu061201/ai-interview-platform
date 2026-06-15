import axios from 'axios';

// Global default timeout: 120 seconds (Render cold start can take ~60-120s)
axios.defaults.timeout = 120000;

// Retry config
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 3000;

// Request interceptor
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with retry on timeout/network errors
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // --- Auto-retry on timeout or network errors (NOT on 4xx/5xx) ---
    const isNetworkOrTimeout = !error.response && (error.code === 'ECONNABORTED' || error.message?.includes('timeout') || error.message?.includes('Network Error'));
    const retryCount = originalRequest._retryCount || 0;
    
    if (isNetworkOrTimeout && retryCount < MAX_RETRIES && !originalRequest._skipRetry) {
      originalRequest._retryCount = retryCount + 1;
      console.log(`Request timeout/network error, retrying (${originalRequest._retryCount}/${MAX_RETRIES})...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * originalRequest._retryCount));
      return axios(originalRequest);
    }

    // --- Token refresh on 401 ---
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (originalRequest.url.includes('/api/auth/refresh')) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error("No refresh token");
        
        const res = await axios.post(`${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://ai-interview-backend-ns52.onrender.com/api' : 'http://localhost:8080/api')}` + '/auth/refresh', { refreshToken });
        
        if (res.status === 200) {
          localStorage.setItem('token', res.data.accessToken);
          localStorage.setItem('refreshToken', res.data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
          return axios(originalRequest);
        }
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default axios;

