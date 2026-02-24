import api from './api';

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  cambiarPassword: (data) => api.put('/auth/cambiar-password', data),
  actualizarPerfil: (data) => api.put('/auth/perfil', data),
};

export const login = async (credentials) => {
  const res = await authService.login(credentials);
  // backend returns { success, message, data: { token, usuario } }
  // return the inner data object so callers can access token and usuario directly
  return res.data.data;
};

export const updateProfile = (data) => authService.actualizarPerfil(data);

export const changePassword = (data) => authService.cambiarPassword(data);
