import api from './client';

export const lotsApi = {
  getAll: (params = {}) => api.get('/lots', { params }),
  getById: (id) => api.get(`/lots/${id}`),
  getSlots: (id, params = {}) => api.get(`/lots/${id}/slots`, { params }),
  getAvailability: (id) => api.get(`/lots/${id}/availability`),
};
