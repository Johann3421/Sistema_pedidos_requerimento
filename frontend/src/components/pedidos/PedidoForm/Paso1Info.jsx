import { useProveedores } from '../../../hooks/useProveedores';

export default function Paso1Info({ data, onChange, errors }) {
  const { data: proveedores } = useProveedores();

  const update = (field, value) => onChange({ ...data, [field]: value });

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Título del pedido *</label>
        <input
          value={data.titulo || ''}
          onChange={(e) => update('titulo', e.target.value)}
          className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          placeholder="Ej: Compra de suministros de oficina Q1"
        />
        {errors?.titulo && <p className="text-red-500 text-xs mt-1">{errors.titulo}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
        <div className="flex gap-3">
          {[{ value: 'pedido', label: 'Pedido' }, { value: 'requerimiento', label: 'Requerimiento' }].map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => update('tipo', t.value)}
              className={`flex-1 py-2.5 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                data.tipo === t.value
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea
          value={data.descripcion || ''}
          onChange={(e) => update('descripcion', e.target.value)}
          rows={3}
          maxLength={2000}
          className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
          placeholder="Descripción detallada del pedido..."
        />
        <p className="text-xs text-gray-400 text-right">{(data.descripcion || '').length}/2000</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
        <div className="flex gap-2">
          {[
            { value: 'baja', label: 'Baja', color: '#27AE60' },
            { value: 'media', label: 'Media', color: '#F39C12' },
            { value: 'alta', label: 'Alta', color: '#E67E22' },
            { value: 'urgente', label: 'Urgente', color: '#E74C3C' },
          ].map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => update('prioridad', p.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                data.prioridad === p.value
                  ? 'text-white shadow-md'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              style={data.prioridad === p.value ? { backgroundColor: p.color } : {}}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha requerida</label>
          <input
            type="date"
            value={data.fecha_requerida || ''}
            onChange={(e) => update('fecha_requerida', e.target.value)}
            className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor (opcional)</label>
          <select
            value={data.proveedor_id || ''}
            onChange={(e) => update('proveedor_id', e.target.value || null)}
            className="w-full border rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-primary/20 outline-none"
          >
            <option value="">Seleccionar proveedor...</option>
            {proveedores?.filter((p) => p.activo).map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
