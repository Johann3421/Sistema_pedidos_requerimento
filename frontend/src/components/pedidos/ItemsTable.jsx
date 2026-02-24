import { Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export default function ItemsTable({ items, onChange, readOnly, moneda }) {
  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'cantidad' || field === 'precio_unitario') {
      const cant = parseFloat(newItems[index].cantidad) || 0;
      const precio = parseFloat(newItems[index].precio_unitario) || 0;
      newItems[index].subtotal = cant * precio;
    }
    onChange(newItems);
  };

  const removeItem = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  if (readOnly) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-3 text-gray-600 font-semibold">Descripción</th>
              <th className="text-right py-2 px-3 text-gray-600 font-semibold">Cantidad</th>
              <th className="text-left py-2 px-3 text-gray-600 font-semibold">Unidad</th>
              <th className="text-right py-2 px-3 text-gray-600 font-semibold">P. Unitario</th>
              <th className="text-right py-2 px-3 text-gray-600 font-semibold">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-gray-50">
                <td className="py-2 px-3">{item.descripcion}</td>
                <td className="py-2 px-3 text-right">{item.cantidad}</td>
                <td className="py-2 px-3">{item.unidad}</td>
                <td className="py-2 px-3 text-right">{formatCurrency(item.precio_unitario, moneda)}</td>
                <td className="py-2 px-3 text-right font-medium">{formatCurrency(item.subtotal, moneda)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 px-2 text-gray-600 font-semibold">Descripción *</th>
            <th className="text-left py-2 px-2 text-gray-600 font-semibold w-28">Cantidad</th>
            <th className="text-left py-2 px-2 text-gray-600 font-semibold w-24">Unidad</th>
            <th className="text-left py-2 px-2 text-gray-600 font-semibold w-32">P. Unitario</th>
            <th className="text-right py-2 px-2 text-gray-600 font-semibold w-28">Subtotal</th>
            <th className="w-10"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-b border-gray-50">
              <td className="py-1.5 px-2">
                <input
                  value={item.descripcion || ''}
                  onChange={(e) => updateItem(i, 'descripcion', e.target.value)}
                  className="w-full border rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="Descripción del ítem"
                />
              </td>
              <td className="py-1.5 px-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.cantidad || ''}
                  onChange={(e) => updateItem(i, 'cantidad', e.target.value)}
                  className="w-full border rounded-lg px-2.5 py-1.5 text-sm text-right focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </td>
              <td className="py-1.5 px-2">
                <select
                  value={item.unidad || 'unidad'}
                  onChange={(e) => updateItem(i, 'unidad', e.target.value)}
                  className="w-full border rounded-lg px-2 py-1.5 text-sm bg-white focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  {['unidad','caja','paquete','resma','galón','litro','metro','kilogramo','servicio','hora'].map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </td>
              <td className="py-1.5 px-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.precio_unitario || ''}
                  onChange={(e) => updateItem(i, 'precio_unitario', e.target.value)}
                  className="w-full border rounded-lg px-2.5 py-1.5 text-sm text-right focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </td>
              <td className="py-1.5 px-2 text-right font-medium text-gray-700">
                {formatCurrency((parseFloat(item.cantidad) || 0) * (parseFloat(item.precio_unitario) || 0), moneda)}
              </td>
              <td className="py-1.5 px-1">
                <button onClick={() => removeItem(i)} className="p-1 text-red-400 hover:text-red-600 rounded">
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
