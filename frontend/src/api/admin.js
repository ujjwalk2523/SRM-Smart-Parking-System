import api from './client';

export const adminApi = {
  // Statistics & Logs
  getStats: () => api.get('/admin/stats'),
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  getAuditLogs: (params = {}) => api.get('/admin/audit-logs', { params }),

  // Location Management
  getLocations: () => api.get('/admin/locations'),
  createLocation: (data) => api.post('/admin/locations', data),
  updateLocation: (id, data) => api.put(`/admin/locations/${id}`, data),
  deleteLocation: (id) => api.delete(`/admin/locations/${id}`),

  // Lot Management
  getLots: () => api.get('/admin/lots'),
  createLot: (data) => api.post('/admin/lots', data),
  updateLot: (id, data) => api.put(`/admin/lots/${id}`, data),
  deleteLot: (id) => api.delete(`/admin/lots/${id}`),

  // Slot Management
  getSlots: (lotId) => api.get('/admin/slots', { params: { lotId } }),
  createSlot: (data) => api.post('/admin/slots', data),
  updateSlotStatus: (id, status) => api.put(`/admin/slots/${id}/status`, null, { params: { status } }),
  deleteSlot: (id) => api.delete(`/admin/slots/${id}`),

  // Bookings Management
  getBookings: (params = {}) => api.get('/admin/bookings', { params }),
  cancelBooking: (id, reason) => api.put(`/admin/bookings/${id}/cancel`, null, { params: { reason } }),

  // Pricing Rules Management
  getPricing: (lotId) => api.get('/admin/pricing', { params: { lotId } }),
  createPricing: (data) => api.post('/admin/pricing', data),
  updatePricing: (id, data) => api.put(`/admin/pricing/${id}`, data),
  deletePricing: (id) => api.delete(`/admin/pricing/${id}`),
};
