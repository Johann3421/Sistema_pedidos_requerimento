import api from './api';

export const proveedoresService = {
  listar: () => api.get('/proveedores'),
  crear: (data) => api.post('/proveedores', data),
  actualizar: (id, data) => api.put(`/proveedores/${id}`, data),
  toggleActivo: (id) => api.patch(`/proveedores/${id}/toggle-activo`),
};

export const categoriasService = {
  listar: () => api.get('/categorias'),
  crear: (data) => api.post('/categorias', data),
  actualizar: (id, data) => api.put(`/categorias/${id}`, data),
  toggleActivo: (id) => api.patch(`/categorias/${id}/toggle-activo`),
};

export const notificacionesService = {
  listar: () => api.get('/notificaciones'),
  marcarLeida: (id) => api.patch(`/notificaciones/${id}/leer`),
  marcarTodasLeidas: () => api.patch('/notificaciones/leer-todas'),
};
