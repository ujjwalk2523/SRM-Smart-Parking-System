import api from './client';

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};
