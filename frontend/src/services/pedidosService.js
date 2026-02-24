import api from './api';

export const pedidosService = {
  listar: (params) => api.get('/pedidos', { params }),
  obtener: (id) => api.get(`/pedidos/${id}`),
  crear: (data) => api.post('/pedidos', data),
  actualizar: (id, data) => api.put(`/pedidos/${id}`, data),
  cambiarEstado: (id, data) => api.patch(`/pedidos/${id}/estado`, data),
  eliminar: (id) => api.delete(`/pedidos/${id}`),
  historial: (id) => api.get(`/pedidos/${id}/historial`),
  subirAdjunto: (id, formData) => api.post(`/pedidos/${id}/adjunto`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  exportarPDF: (params) => api.get('/pedidos/exportar/pdf', { params, responseType: 'blob' }),
  exportarExcel: (params) => api.get('/pedidos/exportar/excel', { params, responseType: 'blob' }),
};
