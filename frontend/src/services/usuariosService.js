import api from './api';

export const usuariosService = {
  listar: () => api.get('/usuarios'),
  obtener: (id) => api.get(`/usuarios/${id}`),
  crear: (data) => api.post('/usuarios', data),
  actualizar: (id, data) => api.put(`/usuarios/${id}`, data),
  toggleActivo: (id) => api.patch(`/usuarios/${id}/toggle-activo`),
};
