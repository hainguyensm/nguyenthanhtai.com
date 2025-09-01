import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  login = async (credentials) => {
    const response = await this.client.post('/auth/login', credentials);
    return response.data;
  };

  register = async (userData) => {
    const response = await this.client.post('/auth/register', userData);
    return response.data;
  };

  getCurrentUser = async () => {
    const response = await this.client.get('/auth/me');
    return response.data;
  };

  // Posts endpoints
  getPosts = async (params = {}) => {
    const response = await this.client.get('/posts', { params });
    return response.data;
  };

  getPost = async (slug) => {
    const response = await this.client.get(`/posts/${slug}`);
    return response.data;
  };

  createPost = async (postData) => {
    const response = await this.client.post('/posts', postData);
    return response.data;
  };

  updatePost = async (id, postData) => {
    const response = await this.client.put(`/posts/${id}`, postData);
    return response.data;
  };

  deletePost = async (id) => {
    await this.client.delete(`/posts/${id}`);
  };

  // Categories endpoints
  getCategories = async () => {
    const response = await this.client.get('/categories');
    return response.data;
  };

  // Admin-specific categories endpoint with posts count
  getAdminCategories = async () => {
    const response = await this.client.get('/admin/categories');
    return response.data;
  };

  createCategory = async (categoryData) => {
    const response = await this.client.post('/categories', categoryData);
    return response.data;
  };

  // Tags endpoints
  getTags = async () => {
    const response = await this.client.get('/tags');
    return response.data;
  };

  // Users endpoints
  getUsers = async (params = {}) => {
    const response = await this.client.get('/users', { params });
    return response.data;
  };

  getUser = async (id) => {
    const response = await this.client.get(`/users/${id}`);
    return response.data;
  };

  updateUser = async (id, userData) => {
    const response = await this.client.put(`/users/${id}`, userData);
    return response.data;
  };

  deleteUser = async (id) => {
    await this.client.delete(`/users/${id}`);
  };

  // Media endpoints
  getMedia = async (params = {}) => {
    const response = await this.client.get('/media', { params });
    return response.data;
  };

  uploadMedia = async (formData) => {
    const response = await this.client.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  };

  // Comments endpoints
  getComments = async (params = {}) => {
    const response = await this.client.get('/comments', { params });
    return response.data;
  };

  updateComment = async (id, commentData) => {
    const response = await this.client.put(`/comments/${id}`, commentData);
    return response.data;
  };

  deleteComment = async (id) => {
    await this.client.delete(`/comments/${id}`);
  };

  // Settings endpoints
  getSettings = async () => {
    const response = await this.client.get('/settings');
    return response.data;
  };

  updateSettings = async (settings) => {
    const response = await this.client.post('/settings', settings);
    return response.data;
  };

  // Dashboard endpoints
  getDashboardStats = async () => {
    const response = await this.client.get('/dashboard/stats');
    return response.data;
  };

  // Comments endpoints
  getPostComments = async (postSlug) => {
    try {
      const response = await this.client.get(`/posts/${postSlug}/comments`);
      return response.data;
    } catch (error) {
      // Return empty array if comments not found or API not implemented yet
      return [];
    }
  };

  addComment = async (postSlug, commentData) => {
    try {
      const response = await this.client.post(`/posts/${postSlug}/comments`, commentData);
      return response.data;
    } catch (error) {
      // For now, return a mock comment if API is not implemented
      return {
        id: Date.now(),
        author_name: commentData.name,
        author_email: commentData.email,
        content: commentData.content,
        created_at: new Date().toISOString(),
      };
    }
  };
}

export default new ApiService();