import api from './client';

export const sessionsApi = {
  checkIn: (data) => api.post('/sessions/check-in', data),
  startSession: (bookingId) => api.post(`/sessions/${bookingId}/start`),
  checkOut: (id, data) => api.post(`/sessions/${id}/check-out`, data),
  endSession: (sessionId, data) => api.post(`/sessions/${sessionId}/end`, data),
  getActive: () => api.get('/sessions/active'),
  getById: (id) => api.get(`/sessions/${id}`),
  getByBookingId: (bookingId) => api.get(`/sessions/booking/${bookingId}`),
};
