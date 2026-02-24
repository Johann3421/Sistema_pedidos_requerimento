import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, LayoutGrid, List, Search, Filter, Download } from 'lucide-react';
import { usePedidos } from '../hooks/usePedidos';
import useAuthStore from '../store/authStore';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import EstadoBadge from '../components/pedidos/EstadoBadge';
import KanbanBoard from '../components/pedidos/KanbanBoard';
import EmptyState from '../components/ui/EmptyState';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ESTADOS, PRIORIDADES } from '../utils/constants';
import { exportPedidosExcel } from '../utils/exportExcel';

export default function Pedidos() {
  const { usuario } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('table');
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroPrioridad, setFiltroPrioridad] = useState('');

  const page = Number(searchParams.get('page')) || 1;

  const { data, isLoading } = usePedidos({
    page,
    limit: 15,
    search: search || undefined,
    estado: filtroEstado || undefined,
    prioridad: filtroPrioridad || undefined,
  });

  const pedidos = data?.pedidos || [];
  const pagination = data?.paginacion || {};

  const columns = [
    {
      key: 'codigo',
      label: 'Código',
      sortable: true,
      render: (value, row) => (
        <Link to={`/pedidos/${row.id}`} className="text-primary font-semibold hover:underline">
          {value}
        </Link>
      ),
    },
    {
      key: 'titulo',
      label: 'Título',
      sortable: true,
      render: (value) => (
        <div className="max-w-xs truncate">
          <span className="text-gray-800">{value}</span>
        </div>
      ),
    },
    { key: 'tipo', label: 'Tipo', render: (value) => <span className="capitalize text-sm">{value}</span> },
    { key: 'prioridad', label: 'Prioridad', render: (value) => <span className={`capitalize text-xs font-medium px-2 py-1 rounded-lg ${value === 'urgente' ? 'bg-red-100 text-red-700' : value === 'alta' ? 'bg-orange-100 text-orange-700' : value === 'media' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>{value}</span> },
    { key: 'estado', label: 'Estado', render: (value) => <EstadoBadge estado={value} /> },
    { key: 'total', label: 'Total', sortable: true, render: (value, row) => <span className="font-semibold">{formatCurrency(value, row.moneda)}</span> },
    { key: 'fecha_requerida', label: 'Fecha requerida', sortable: true, render: (value) => <span className="text-sm text-gray-500">{formatDate(value)}</span> },
  ];

  const handlePageChange = (p) => {
    setSearchParams({ page: p.toString() });
  };

  const handleExport = () => {
    if (pedidos.length) exportPedidosExcel(pedidos);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Pedidos</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de pedidos y requerimientos internos</p>
        </div>
        <div className="flex items-center gap-2">
          {pedidos.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download size={16} />
              Exportar
            </Button>
          )}
          {['admin', 'operador'].includes(usuario?.rol) && (
            <Link to="/pedidos/nuevo">
              <Button>
                <Plus size={18} />
                Nuevo Pedido
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por código, título..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-gray-700 w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="">Todos los estados</option>
              {Object.entries(ESTADOS).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
            <select
              value={filtroPrioridad}
              onChange={(e) => setFiltroPrioridad(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="">Todas las prioridades</option>
              {PRIORIDADES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white shadow-sm text-primary' : 'text-gray-400'}`}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'kanban' ? 'bg-white shadow-sm text-primary' : 'text-gray-400'}`}
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <SkeletonLoader key={i} className="h-14 rounded-xl" />)}
        </div>
      ) : !pedidos.length ? (
        <EmptyState
          title="Sin pedidos"
          description="No se encontraron pedidos con los filtros aplicados."
          actionLabel={['admin', 'operador'].includes(usuario?.rol) ? 'Crear Pedido' : undefined}
          actionTo="/pedidos/nuevo"
        />
      ) : viewMode === 'table' ? (
        <DataTable
          columns={columns}
          data={pedidos}
          totalPages={pagination.total_paginas || 1}
          currentPage={page}
          onPageChange={handlePageChange}
        />
      ) : (
        <KanbanBoard pedidos={pedidos} />
      )}
    </div>
  );
}
