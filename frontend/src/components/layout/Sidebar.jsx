import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileText, Users, Truck, Tag, BarChart3, User, X, ChevronLeft,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useUiStore from '../../store/uiStore';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'aprobador', 'operador', 'visualizador'] },
  { to: '/pedidos', label: 'Pedidos', icon: FileText, roles: ['admin', 'aprobador', 'operador', 'visualizador'] },
  { to: '/usuarios', label: 'Usuarios', icon: Users, roles: ['admin'] },
  { to: '/proveedores', label: 'Proveedores', icon: Truck, roles: ['admin', 'aprobador'] },
  { to: '/categorias', label: 'Categorías', icon: Tag, roles: ['admin', 'aprobador'] },
  { to: '/reportes', label: 'Reportes', icon: BarChart3, roles: ['admin', 'aprobador', 'operador', 'visualizador'] },
  { to: '/perfil', label: 'Mi Perfil', icon: User, roles: ['admin', 'aprobador', 'operador', 'visualizador'] },
];

export default function Sidebar() {
  const { usuario } = useAuthStore();
  const { sidebarOpen, toggleSidebar, sidebarMobileOpen, closeMobileSidebar } = useUiStore();
  const rol = usuario?.rol || 'visualizador';

  const filteredItems = NAV_ITEMS.filter((item) => item.roles.includes(rol));

  const sidebarContent = (
    <div className="flex flex-col h-full bg-sidebar-bg text-white">
      {/* Header */}
      <div className="p-5 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <FileText size={20} className="text-white" />
          </div>
          {sidebarOpen && <h1 className="text-lg font-display font-bold">SisPedidos</h1>}
        </div>
        <button onClick={toggleSidebar} className="hidden lg:block p-1 rounded-lg hover:bg-white/10">
          <ChevronLeft size={18} className={`transition-transform ${!sidebarOpen ? 'rotate-180' : ''}`} />
        </button>
        <button onClick={closeMobileSidebar} className="lg:hidden p-1 rounded-lg hover:bg-white/10">
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={closeMobileSidebar}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:bg-white/8 hover:text-white/90'
              }`
            }
          >
            <item.icon size={19} />
            {sidebarOpen && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      {sidebarOpen && usuario && (
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-xs font-bold">
              {usuario.nombre?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{usuario.nombre}</p>
              <p className="text-xs text-white/50 capitalize">{usuario.rol}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:block flex-shrink-0 h-screen sticky top-0 transition-all duration-300
          ${sidebarOpen ? 'w-64' : 'w-20'}`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={closeMobileSidebar}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-64 z-50 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
