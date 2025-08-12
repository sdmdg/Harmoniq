// src/plugins/axios.js (or src/utils/axios.js)
import axios from 'axios';
import router from '../router';

// Create a custom Axios instance
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT token to every outgoing request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle common response errors (e.g., 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If the error response status is 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized request. Token might be expired or invalid. Logging out...');
      // Clear token and user data
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_data');
      // Redirect to login page
      // Use router.currentRoute.value.name to prevent infinite redirect if already on login
      if (router.currentRoute.value.name !== 'login') {
        router.push({ name: 'login' });
      }
    }
    // If it's a 403 Forbidden error (insufficient permissions)
    else if (error.response && error.response.status === 403) {
        console.warn('Forbidden access. User does not have sufficient permissions.');
        // Optionally redirect to an access denied page or home
        // router.push({ name: 'home' }); // Or a custom '/access-denied' route
    }
    return Promise.reject(error); // Important: re-throw the error so component can catch it
  }
);

export default apiClient; // Export the configured Axios instance