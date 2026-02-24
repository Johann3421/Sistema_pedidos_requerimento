import { create } from 'zustand';

const useUiStore = create((set) => ({
  sidebarOpen: true,
  sidebarMobileOpen: false,
  notificacionesOpen: false,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleMobileSidebar: () => set((s) => ({ sidebarMobileOpen: !s.sidebarMobileOpen })),
  openMobileSidebar: () => set({ sidebarMobileOpen: true }),
  closeMobileSidebar: () => set({ sidebarMobileOpen: false }),
  toggleNotificaciones: () => set((s) => ({ notificacionesOpen: !s.notificacionesOpen })),
  closeNotificaciones: () => set({ notificacionesOpen: false }),
}));

export default useUiStore;
