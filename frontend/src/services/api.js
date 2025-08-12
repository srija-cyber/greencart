import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
export const getProfile = () => api.get('/auth/me');

// Drivers API
export const getDrivers = (params) => api.get('/drivers', { params });
export const getDriver = (id) => api.get(`/drivers/${id}`);
export const createDriver = (driverData) => api.post('/drivers', driverData);
export const updateDriver = (id, driverData) => api.put(`/drivers/${id}`, driverData);
export const deleteDriver = (id) => api.delete(`/drivers/${id}`);

// Routes API
export const getRoutes = (params) => api.get('/routes', { params });
export const getRoute = (id) => api.get(`/routes/${id}`);
export const createRoute = (routeData) => api.post('/routes', routeData);
export const updateRoute = (id, routeData) => api.put(`/routes/${id}`, routeData);
export const deleteRoute = (id) => api.delete(`/routes/${id}`);

// Orders API
export const getOrders = (params) => api.get('/orders', { params });
export const getOrder = (id) => api.get(`/orders/${id}`);
export const createOrder = (orderData) => api.post('/orders', orderData);
export const updateOrder = (id, orderData) => api.put(`/orders/${id}`, orderData);
export const deleteOrder = (id) => api.delete(`/orders/${id}`);

// Simulation API
export const startSimulation = (simulationData) => api.post('/simulations/start', simulationData);
export const stopSimulation = (runId) => api.post(`/simulations/${runId}/stop`);
export const getSimulationStatus = (runId) => api.get(`/simulations/${runId}/status`);
export const getSimulationResults = (runId) => api.get(`/simulations/${runId}/results`);

// Simulation History API
export const getSimulationHistory = (filters = {}) => api.get('/simulations', { params: filters });
export const getSimulationDetails = (runId) => api.get(`/simulations/${runId}`);

// Dashboard API
export const getDashboardData = () => api.get('/dashboard');

export default api;
