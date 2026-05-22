import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
});

// Add a request interceptor to include the JWT token in headers
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth services
export const login = (userData) => axios.post(`${API_BASE}/users/login`, userData);
export const register = (userData) => axios.post(`${API_BASE}/users`, userData);

// Task services
export const getTasks = () => api.get('/tasks');
export const getSharedTasks = () => api.get('/tasks/shared');
export const getTask = (id) => api.get(`/tasks/${id}`);
export const createTask = (taskData) => api.post('/tasks', taskData);
export const updateTask = (id, taskData) => api.put(`/tasks/${id}`, taskData);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
export const shareTask = (id, email) => api.put(`/tasks/${id}/share`, { email });

// Attachments services
export const uploadAttachment = (id, formData) => api.post(`/tasks/${id}/attachments`, formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
export const deleteAttachment = (id, attachmentId) => api.delete(`/tasks/${id}/attachments/${attachmentId}`);

// Notifications services
export const getNotifications = () => api.get('/notifications');
export const markNotificationAsRead = (id) => api.put(`/notifications/${id}/read`);

// Analytics services
export const getAnalyticsOverview = () => api.get('/analytics/overview');
export const getAnalyticsTrends = () => api.get('/analytics/trends');

export default api;
