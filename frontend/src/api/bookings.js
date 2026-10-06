import api from './client';

export const bookingsApi = {
  create: (data) => api.post('/bookings', data),
  cancel: (id, reason) => api.put(`/bookings/${id}/cancel`, { reason }),
  getAll: () => api.get('/bookings'),
  getMy: () => api.get('/bookings/my'),
  getActive: () => api.get('/bookings/active'),
  getUpcoming: () => api.get('/bookings/upcoming'),
  getPast: () => api.get('/bookings/past'),
  getById: (id) => api.get(`/bookings/${id}`),
  getByReference: (ref) => api.get(`/bookings/reference/${ref}`),
};
