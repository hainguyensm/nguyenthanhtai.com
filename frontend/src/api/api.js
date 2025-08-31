import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const blogApi = {
  getPosts: (params) => api.get('/posts', { params }),
  getPost: (slug) => api.get(`/posts/${slug}`),
  getCategories: () => api.get('/categories'),
  
  createPost: (data) => api.post('/admin/posts', data),
  updatePost: (id, data) => api.put(`/admin/posts/${id}`, data),
  deletePost: (id) => api.delete(`/admin/posts/${id}`),
  
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  
  // Image management
  getImages: (params) => api.get('/images', { params }),
  deleteImage: (id) => api.delete(`/images/${id}`),
};

export default api;