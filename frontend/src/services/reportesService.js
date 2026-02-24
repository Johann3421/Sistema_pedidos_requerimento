import api from './api';

export const reportesService = {
  listar: (params) => api.get('/reportes', { params }),
  estadisticas: () => api.get('/reportes/estadisticas'),
  exportarPDF: (params) => api.get('/reportes/exportar/pdf', { params, responseType: 'blob' }),
  exportarExcel: (params) => api.get('/reportes/exportar/excel', { params, responseType: 'blob' }),
};
