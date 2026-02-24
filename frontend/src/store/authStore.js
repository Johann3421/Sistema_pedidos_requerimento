import { create } from 'zustand';

const useAuthStore = create((set, get) => ({
  token: localStorage.getItem('token') || null,
  // Safe parse: handle cases where localStorage contains the string 'undefined' or invalid JSON
  usuario: (() => {
    try {
      const raw = localStorage.getItem('usuario');
      if (!raw || raw === 'undefined') return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  })(),
  isAuthenticated: !!localStorage.getItem('token'),

  setAuth: (token, usuario) => {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    document.documentElement.setAttribute('data-theme', usuario.tipo_entidad || 'entidad');
    set({ token, usuario, isAuthenticated: true });
  },

  updateUsuario: (data) => {
    const usuario = { ...get().usuario, ...data };
    localStorage.setItem('usuario', JSON.stringify(usuario));
    set({ usuario });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    document.documentElement.removeAttribute('data-theme');
    set({ token: null, usuario: null, isAuthenticated: false });
  },

  initTheme: () => {
    const usuario = get().usuario;
    if (usuario?.tipo_entidad) {
      document.documentElement.setAttribute('data-theme', usuario.tipo_entidad);
    }
  },
}));

export default useAuthStore;
