import api from './client';

export const locationsApi = {
  getAll: () => api.get('/locations'),
  getById: (id) => api.get(`/locations/${id}`),
  getLots: (id) => api.get(`/locations/${id}/lots`),
};
