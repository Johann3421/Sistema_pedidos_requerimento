import { Bell, Menu, Search, LogOut } from 'lucide-react';
import CurrencySelector from './CurrencySelector';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useUiStore from '../../store/uiStore';
import { useNotificaciones } from '../../hooks/useNotificaciones';

export default function Topbar() {
  const { usuario, logout } = useAuthStore();
  const { openMobileSidebar, toggleNotificaciones } = useUiStore();
  const navigate = useNavigate();
  const { data: notificaciones } = useNotificaciones();

  const noLeidas = notificaciones?.filter((n) => !n.leida)?.length || 0;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={openMobileSidebar}
          className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600"
        >
          <Menu size={20} />
        </button>

        <div className="hidden sm:flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 w-64">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Buscar..."
            className="bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <CurrencySelector />
        {/* Notifications */}
        <button
          onClick={toggleNotificaciones}
          className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <Bell size={20} />
          {noLeidas > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
              {noLeidas > 9 ? '9+' : noLeidas}
            </span>
          )}
        </button>

        {/* User */}
        <div className="flex items-center gap-3 pl-3 border-l border-gray-200 ml-1">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-gray-800">{usuario?.nombre}</p>
            <p className="text-xs text-gray-500 capitalize">{usuario?.tipo_entidad} • {usuario?.rol}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
            {usuario?.nombre?.charAt(0)?.toUpperCase()}
          </div>
          <button onClick={handleLogout} className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Cerrar sesión">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
