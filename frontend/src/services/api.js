import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getCurrentUser: () => api.get('/auth/me'),
};

export const participantsAPI = {
  getAll: (search) => api.get('/participants', { params: { search } }),
  getById: (id) => api.get(`/participants/${id}`),
  create: (data) => api.post('/participants', data),
  update: (id, data) => api.put(`/participants/${id}`, data),
  delete: (id) => api.delete(`/participants/${id}`),
};

export const coursesAPI = {
  getAll: (search) => api.get('/courses', { params: { search } }),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
};

export const credentialsAPI = {
  getAll: () => api.get('/credentials'),
  getById: (id) => api.get(`/credentials/${id}`),
  create: (data) => api.post('/credentials', data),
  delete: (id) => api.delete(`/credentials/${id}`),
  generateCertificate: (id) => api.get(`/credentials/${id}/generate`, { responseType: 'blob' }),
  validate: (credentialId) => api.get(`/credentials/validate/${credentialId}`),
};

export default api;