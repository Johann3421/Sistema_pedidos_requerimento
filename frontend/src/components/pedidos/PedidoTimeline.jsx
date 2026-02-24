import { formatRelativeDate, getInitials } from '../../utils/formatters';

const ACTION_COLORS = {
  borrador: '#95A5A6',
  pendiente: '#F39C12',
  aprobado: '#2E86C1',
  rechazado: '#E74C3C',
  en_proceso: '#8E44AD',
  completado: '#27AE60',
  cancelado: '#7F8C8D',
};

export default function PedidoTimeline({ historial }) {
  if (!historial?.length) return <p className="text-sm text-gray-400">Sin historial</p>;

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100" />
      <div className="space-y-4">
        {historial.map((h, i) => (
          <div key={h.id || i} className="relative flex gap-4 pl-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 z-10"
              style={{ backgroundColor: ACTION_COLORS[h.estado_nuevo] || '#999' }}
            >
              {h.usuario?.nombre ? getInitials(h.usuario.nombre) : '?'}
            </div>
            <div className="flex-1 pb-4">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">{h.usuario?.nombre || 'Sistema'}</span>
                {' cambió estado a '}
                <span className="font-semibold" style={{ color: ACTION_COLORS[h.estado_nuevo] }}>
                  {h.estado_nuevo}
                </span>
                {h.estado_anterior && (
                  <span className="text-gray-400"> (desde {h.estado_anterior})</span>
                )}
              </p>
              {h.comentario && (
                <p className="text-sm text-gray-500 mt-1 italic">"{h.comentario}"</p>
              )}
              <p className="text-xs text-gray-400 mt-1">{formatRelativeDate(h.created_at)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
