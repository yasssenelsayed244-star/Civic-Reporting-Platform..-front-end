import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auto-attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ───
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/profile', data)
};

// ─── Reports API ───
export const reportsAPI = {
  getAll: (params) => api.get('/reports', { params }),
  getById: (id) => api.get(`/reports/${id}`),
  create: (formData) => api.post('/reports', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  classify: (description) => api.post('/reports/classify', { description }),
  upvote: (id) => api.patch(`/reports/${id}/upvote`),
  delete: (id) => api.delete(`/reports/${id}`),
  submitFeedback: (id, data) => api.post(`/reports/${id}/feedback`, data),
  getMyReports: () => api.get('/reports/user/my-reports'),
  getLeaderboard: () => api.get('/reports/leaderboard')
};

// ─── Admin API ───
export const adminAPI = {
  getReports: (params) => api.get('/admin/reports', { params }),
  updateStatus: (id, data) => api.patch(`/admin/reports/${id}/status`, data),
  getStats: () => api.get('/admin/stats')
};

// ─── Chat API ───
export const chatAPI = {
  send: (message) => api.post('/chat', { message }),
  getHistory: () => api.get('/chat/history')
};

// ─── Notifications API ───
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all')
};

export default api;
