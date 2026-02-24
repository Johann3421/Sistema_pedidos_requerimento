import { useNavigate } from 'react-router-dom';
import PedidoCard from './PedidoCard';
import { KANBAN_COLUMNS, ESTADOS } from '../../utils/constants';

export default function KanbanBoard({ pedidos }) {
  const navigate = useNavigate();

  const columns = KANBAN_COLUMNS.map((estado) => ({
    ...ESTADOS[estado],
    key: estado,
    items: pedidos?.filter((p) => p.estado === estado) || [],
  }));

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((col) => (
        <div key={col.key} className="flex-shrink-0 w-72">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
            <h3 className="text-sm font-semibold text-gray-700">{col.label}</h3>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              {col.items.length}
            </span>
          </div>
          <div className="space-y-3 min-h-[200px] bg-gray-50/50 rounded-xl p-2">
            {col.items.length === 0 ? (
              <p className="text-xs text-gray-300 text-center py-8">Sin pedidos</p>
            ) : (
              col.items.map((pedido) => (
                <PedidoCard
                  key={pedido.id}
                  pedido={pedido}
                  onClick={() => navigate(`/pedidos/${pedido.id}`)}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
