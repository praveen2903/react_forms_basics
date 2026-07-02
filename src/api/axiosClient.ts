import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
});

axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Skip retry logic for auth routes to prevent loops
    if (originalRequest.url?.includes('/api/auth/')) {
        return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, { token: refreshToken });
          const newAccessToken = response.data.accessToken;
          localStorage.setItem('accessToken', newAccessToken);
          
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return axiosClient(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
