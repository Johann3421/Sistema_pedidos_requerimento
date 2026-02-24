import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, CheckCheck, Clock, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import useUiStore from '../../store/uiStore';
import { useNotificaciones, useMarcarLeida, useMarcarTodasLeidas } from '../../hooks/useNotificaciones';
import Spinner from '../ui/Spinner';

const TIPO_ICON = {
  estado_cambio: FileText,
  nuevo_pedido: FileText,
  aprobacion: CheckCheck,
  rechazo: X,
  general: Bell,
};

export default function NotificacionesDrawer() {
  const { notificacionesOpen, closeNotificaciones } = useUiStore();
  const { data: notificaciones, isLoading } = useNotificaciones();
  const marcarLeida = useMarcarLeida();
  const marcarTodas = useMarcarTodasLeidas();

  const handleMarcarLeida = (id) => {
    marcarLeida.mutate(id);
  };

  const handleMarcarTodas = () => {
    marcarTodas.mutate();
  };

  const noLeidas = notificaciones?.filter((n) => !n.leida)?.length || 0;

  return (
    <AnimatePresence>
      {notificacionesOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-50"
            onClick={closeNotificaciones}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed right-0 top-0 bottom-0 w-96 max-w-full bg-white z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={20} className="text-primary" />
                <h2 className="text-lg font-display font-bold text-gray-800">Notificaciones</h2>
                {noLeidas > 0 && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
                    {noLeidas}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {noLeidas > 0 && (
                  <button
                    onClick={handleMarcarTodas}
                    className="text-xs text-primary hover:text-primary/80 font-medium"
                    disabled={marcarTodas.isPending}
                  >
                    Marcar todas
                  </button>
                )}
                <button onClick={closeNotificaciones} className="p-1 rounded-lg hover:bg-gray-100">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Spinner />
                </div>
              ) : !notificaciones?.length ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Bell size={40} className="mb-3 opacity-50" />
                  <p className="text-sm font-medium">Sin notificaciones</p>
                  <p className="text-xs mt-1">Estás al día</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notificaciones.map((notif) => {
                    const Icon = TIPO_ICON[notif.tipo] || Bell;
                    return (
                      <button
                        key={notif.id}
                        onClick={() => !notif.leida && handleMarcarLeida(notif.id)}
                        className={`w-full text-left p-4 hover:bg-gray-50 transition-colors flex gap-3 ${
                          !notif.leida ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            !notif.leida ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!notif.leida ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                            {notif.titulo}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.mensaje}</p>
                          <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400">
                            <Clock size={12} />
                            <span>
                              {(() => {
                                // Safely resolve created date (support createdAt or created_at)
                                const raw = notif.createdAt ?? notif.created_at ?? notif.createdAtRaw ?? null;
                                if (!raw) return '—';
                                const d = new Date(raw);
                                if (Number.isNaN(d.getTime())) return '—';
                                return formatDistanceToNow(d, { addSuffix: true, locale: es });
                              })()}
                            </span>
                          </div>
                        </div>
                        {!notif.leida && (
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
