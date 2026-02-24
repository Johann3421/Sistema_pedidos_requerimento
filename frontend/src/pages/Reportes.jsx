import { useState } from 'react';
import { BarChart3, Download, Filter, ChevronDown, ChevronUp, FileText, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { reportesService } from '../services/reportesService';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import EstadoBadge from '../components/pedidos/EstadoBadge';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import EmptyState from '../components/ui/EmptyState';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ESTADOS, PRIORIDADES, TIPOS_PEDIDO } from '../utils/constants';
import { exportReporteExcel } from '../utils/exportExcel';
import { exportReportePDF } from '../utils/exportPDF';

export default function Reportes() {
  const [showFilters, setShowFilters] = useState(true);
  const [filtros, setFiltros] = useState({
    estado: '', prioridad: '', tipo: '', fecha_desde: '', fecha_hasta: '', search: '',
  });
  const [page, setPage] = useState(1);

  const queryParams = {
    page,
    limit: 20,
    ...Object.fromEntries(Object.entries(filtros).filter(([_, v]) => v)),
  };

  const { data, isLoading } = useQuery({
    queryKey: ['reportes', queryParams],
    queryFn: () => reportesService.listar(queryParams).then((r) => r.data),
  });

  const pedidos = data?.data || [];
  const paginacion = data?.paginacion || {};

  const columns = [
    {
      key: 'codigo', label: 'Código', sortable: true,
      render: (value) => <span className="text-primary font-semibold">{value}</span>,
    },
    { key: 'titulo', label: 'Título', render: (value) => <span className="text-sm truncate max-w-xs block">{value}</span> },
    { key: 'tipo', label: 'Tipo', render: (value) => <span className="capitalize text-sm">{value}</span> },
    {
      key: 'prioridad', label: 'Prioridad',
      render: (value) => (
        <span className={`capitalize text-xs font-medium px-2 py-1 rounded-lg ${
          value === 'urgente' ? 'bg-red-100 text-red-700'
            : value === 'alta' ? 'bg-orange-100 text-orange-700'
              : value === 'media' ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-600'
        }`}>
          {value}
        </span>
      ),
    },
    { key: 'estado', label: 'Estado', render: (value) => <EstadoBadge estado={value} /> },
    { key: 'total', label: 'Total', sortable: true, render: (value, row) => <span className="font-semibold">{formatCurrency(value, row.moneda)}</span> },
    { key: 'fecha_requerida', label: 'Fecha requerida', sortable: true, render: (value) => <span className="text-sm text-gray-500">{formatDate(value)}</span> },
  ];

  const handleUpdateFilter = (key, value) => {
    setFiltros((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFiltros({ estado: '', prioridad: '', tipo: '', fecha_desde: '', fecha_hasta: '', search: '' });
    setPage(1);
  };

  const handleExportExcel = () => {
    if (pedidos.length) exportReporteExcel(pedidos);
  };

  const handleExportPDF = () => {
    if (pedidos.length) exportReportePDF(pedidos);
  };

  const quickReports = [
    { label: 'Pedidos Pendientes', onClick: () => { handleClearFilters(); handleUpdateFilter('estado', 'pendiente'); } },
    { label: 'Pedidos Urgentes', onClick: () => { handleClearFilters(); handleUpdateFilter('prioridad', 'urgente'); } },
    { label: 'Completados este mes', onClick: () => {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      handleClearFilters();
      setFiltros((p) => ({ ...p, estado: 'completado', fecha_desde: firstDay }));
    }},
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-500 text-sm mt-1">Generación de reportes y análisis de datos</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportExcel} disabled={!pedidos.length}>
            <Download size={16} /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={!pedidos.length}>
            <Download size={16} /> PDF
          </Button>
        </div>
      </div>

      {/* Quick Reports */}
      <div className="flex flex-wrap gap-2">
        {quickReports.map((qr) => (
          <button
            key={qr.label}
            onClick={qr.onClick}
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-primary/5 hover:border-primary/20 hover:text-primary transition-colors"
          >
            <FileText size={14} className="inline mr-1.5" />
            {qr.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Filter size={16} />
            Filtros
          </div>
          {showFilters ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>

        {showFilters && (
          <div className="px-5 pb-4 pt-1 border-t border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mt-3">
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                <Search size={14} className="text-gray-400" />
                <input
                  type="text" placeholder="Buscar..."
                  value={filtros.search} onChange={(e) => handleUpdateFilter('search', e.target.value)}
                  className="bg-transparent border-none outline-none text-sm w-full"
                />
              </div>
              <select
                value={filtros.estado} onChange={(e) => handleUpdateFilter('estado', e.target.value)}
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="">Todos los estados</option>
                {Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <select
                value={filtros.prioridad} onChange={(e) => handleUpdateFilter('prioridad', e.target.value)}
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="">Todas las prioridades</option>
                {PRIORIDADES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
              <select
                value={filtros.tipo} onChange={(e) => handleUpdateFilter('tipo', e.target.value)}
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="">Todos los tipos</option>
                {TIPOS_PEDIDO.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <input
                type="date" value={filtros.fecha_desde}
                onChange={(e) => handleUpdateFilter('fecha_desde', e.target.value)}
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="Desde"
              />
              <input
                type="date" value={filtros.fecha_hasta}
                onChange={(e) => handleUpdateFilter('fecha_hasta', e.target.value)}
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="Hasta"
              />
            </div>
            <div className="flex justify-end mt-3">
              <button onClick={handleClearFilters} className="text-xs text-gray-500 hover:text-primary font-medium">
                Limpiar filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <SkeletonLoader key={i} className="h-14 rounded-xl" />)}
        </div>
      ) : !pedidos.length ? (
        <EmptyState title="Sin resultados" description="No se encontraron pedidos con los filtros aplicados." />
      ) : (
        <>
          <div className="text-sm text-gray-500">
            {paginacion.total || pedidos.length} resultado(s) encontrado(s)
          </div>
          <DataTable
            columns={columns}
            data={pedidos}
            totalPages={paginacion.total_paginas || 1}
            currentPage={page}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
