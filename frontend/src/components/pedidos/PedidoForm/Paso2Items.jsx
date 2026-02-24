import { Plus } from 'lucide-react';
import Button from '../../ui/Button';
import ItemsTable from '../ItemsTable';
import { formatCurrency } from '../../../utils/formatters';

const MONEDAS = [
  { value: 'PEN', label: 'S/ (PEN)' },
  { value: 'USD', label: '$ (USD)' },
];

export default function Paso2Items({ items, onChange, impuestoPct, onImpuestoChange, errors, moneda, setMoneda }) {
  const addItem = () => {
    onChange([...items, { descripcion: '', cantidad: 1, unidad: 'unidad', precio_unitario: 0, subtotal: 0 }]);
  };

  const subtotal = items.reduce((sum, it) => sum + ((parseFloat(it.cantidad) || 0) * (parseFloat(it.precio_unitario) || 0)), 0);
  const impuesto = subtotal * ((parseFloat(impuestoPct) || 0) / 100);
  const total = subtotal + impuesto;

  return (
    <div>
      <div className="flex items-center justify-end mb-3">
        <label className="text-sm text-gray-500 mr-2">Moneda</label>
        <select value={moneda} onChange={(e) => setMoneda(e.target.value)} className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-primary/20 outline-none">
          {MONEDAS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Ítems del pedido</h3>
        <Button size="sm" icon={Plus} onClick={addItem}>Agregar ítem</Button>
      </div>

      {errors?.items && <p className="text-red-500 text-xs mb-3">{errors.items}</p>}

      <ItemsTable items={items} onChange={onChange} moneda={moneda} />

      <div className="mt-6 flex justify-end">
        <div className="w-72 space-y-2">
            <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-medium">{formatCurrency(subtotal, moneda)}</span>
          </div>
          <div className="flex justify-between text-sm items-center gap-2">
            <span className="text-gray-500">Impuesto (%)</span>
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={impuestoPct || ''}
              onChange={(e) => onImpuestoChange(e.target.value)}
              className="w-20 border rounded-lg px-2 py-1 text-sm text-right focus:ring-2 focus:ring-primary/20 outline-none"
            />
            <span className="font-medium w-24 text-right">{formatCurrency(impuesto, moneda)}</span>
          </div>
          <div className="border-t pt-2 flex justify-between text-base">
            <span className="font-semibold text-gray-700">Total</span>
            <span className="font-bold text-primary">{formatCurrency(total, moneda)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
