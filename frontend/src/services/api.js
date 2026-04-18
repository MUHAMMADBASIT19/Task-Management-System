import axios from 'axios';

const API_URL = 'http://localhost:5000/api/tasks';

const api = axios.create({
  baseURL: API_URL,
});

export const getTasks = () => api.get('/');
export const getTask = (id) => api.get(`/${id}`);
export const createTask = (taskData) => api.post('/', taskData);
export const updateTask = (id, taskData) => api.put(`/${id}`, taskData);
export const deleteTask = (id) => api.delete(`/${id}`);

export default api;
