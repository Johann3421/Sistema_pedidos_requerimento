import ItemsTable from '../ItemsTable';
import EstadoBadge from '../EstadoBadge';
import Badge from '../../ui/Badge';
import { PRIORIDADES } from '../../../utils/constants';
import { formatDate, formatCurrency } from '../../../utils/formatters';

export default function Paso3Revision({ data, items, impuestoPct }) {
  const subtotal = items.reduce((sum, it) => sum + ((parseFloat(it.cantidad) || 0) * (parseFloat(it.precio_unitario) || 0)), 0);
  const impuesto = subtotal * ((parseFloat(impuestoPct) || 0) / 100);
  const total = subtotal + impuesto;
  const prioridad = PRIORIDADES.find((p) => p.value === data.prioridad) || null;

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Información General</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-400">Título:</span> <span className="font-medium">{data.titulo}</span></div>
          <div><span className="text-gray-400">Tipo:</span> <span className="font-medium capitalize">{data.tipo}</span></div>
          <div><span className="text-gray-400">Prioridad:</span> <Badge color={prioridad?.color} bg={prioridad?.bg}>{prioridad?.label || data.prioridad || '-'}</Badge></div>
          <div><span className="text-gray-400">Fecha requerida:</span> <span className="font-medium">{formatDate(data.fecha_requerida) || 'No especificada'}</span></div>
        </div>
        {data.descripcion && (
          <div className="mt-3">
            <span className="text-gray-400 text-sm">Descripción:</span>
            <p className="text-sm text-gray-700 mt-1">{data.descripcion}</p>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Ítems ({items.length})</h3>
        <ItemsTable items={items} readOnly />
        <div className="mt-4 flex justify-end">
          <div className="w-64 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(subtotal, data.moneda)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Impuesto ({impuestoPct || 0}%)</span><span>{formatCurrency(impuesto, data.moneda)}</span></div>
            <div className="border-t pt-1.5 flex justify-between font-bold text-base">
              <span>Total</span><span className="text-primary">{formatCurrency(total, data.moneda)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
