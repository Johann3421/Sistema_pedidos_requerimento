import EstadoBadge from './EstadoBadge';
import Badge from '../ui/Badge';
import { PRIORIDADES } from '../../utils/constants';
import { formatDate, formatCurrency } from '../../utils/formatters';

export default function PedidoCard({ pedido, onClick }) {
  const prioridad = PRIORIDADES[pedido.prioridad];

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-card shadow-card p-4 cursor-pointer hover:shadow-soft transition-all border border-transparent hover:border-primary/10"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono text-gray-400">{pedido.codigo}</span>
        <EstadoBadge estado={pedido.estado} />
      </div>
      <h4 className="text-sm font-semibold text-gray-800 mb-2 line-clamp-2">{pedido.titulo}</h4>
      <div className="flex items-center justify-between">
        <Badge color={prioridad?.color} bg={prioridad?.bg}>{prioridad?.label}</Badge>
        <span className="text-xs text-gray-400">{formatDate(pedido.fecha_requerida)}</span>
      </div>
      {pedido.total > 0 && (
        <p className="text-sm font-semibold text-gray-700 mt-2">{formatCurrency(pedido.total)}</p>
      )}
    </div>
  );
}
