import api from './client';

export const vehiclesApi = {
  getMyVehicles: () => api.get('/vehicles'),
  addVehicle: (data) => api.post('/vehicles', data),
  updateVehicle: (id, data) => api.put(`/vehicles/${id}`, data),
  deleteVehicle: (id) => api.delete(`/vehicles/${id}`),
  setDefault: (id) => api.post(`/vehicles/${id}/default`),
};
