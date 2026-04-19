import axios from 'axios';

const API_URL = 'http://localhost:5000/api/tasks';

const api = axios.create({
  baseURL: API_URL,
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
export const login = (userData) => axios.post('http://localhost:5000/api/users/login', userData);
export const register = (userData) => axios.post('http://localhost:5000/api/users', userData);

// Task services
export const getTasks = () => api.get('/');
export const getTask = (id) => api.get(`/${id}`);
export const createTask = (taskData) => api.post('/', taskData);
export const updateTask = (id, taskData) => api.put(`/${id}`, taskData);
export const deleteTask = (id) => api.delete(`/${id}`);

export default api;
