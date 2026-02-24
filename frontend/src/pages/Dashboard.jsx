import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, Clock, CheckCircle, XCircle, AlertTriangle, ArrowRight, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import useAuthStore from '../store/authStore';
import { useEstadisticas } from '../hooks/usePedidos';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import EstadoBadge from '../components/pedidos/EstadoBadge';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import { formatCurrency } from '../utils/formatters';
import { ESTADOS } from '../utils/constants';

const PIE_COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444'];

export default function Dashboard() {
  const { usuario } = useAuthStore();
  const { data: stats, isLoading } = useEstadisticas();

  const kpis = useMemo(() => {
    if (!stats?.kpis) return [];
    const k = stats.kpis;
    return [
      { title: 'Total Pedidos', value: k.total_pedidos, icon: FileText, color: '#3b82f6' },
      { title: 'Pendientes', value: k.pendientes, icon: Clock, color: '#f59e0b' },
      { title: 'Aprobados', value: k.aprobados, icon: CheckCircle, color: '#10b981' },
      { title: 'Rechazados', value: k.rechazados, icon: XCircle, color: '#ef4444' },
    ];
  }, [stats]);

  const tendencia = useMemo(() => {
    if (!stats?.tendencia_mensual) return [];
    return stats.tendencia_mensual.map((t) => ({
      ...t,
      mes: t.mes || t.label || '',
      total: Number(t.total) || 0,
    }));
  }, [stats]);

  const porCategoria = useMemo(() => {
    if (!stats?.por_categoria) return [];
    return stats.por_categoria.map((c) => ({
      name: c.nombre || c.categoria,
      value: Number(c.total) || 0,
    }));
  }, [stats]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader className="h-10 w-80" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonLoader key={i} className="h-28 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonLoader className="h-72 rounded-2xl" />
          <SkeletonLoader className="h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">
            {greeting()}, {usuario?.nombre?.split(' ')[0]}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
        </div>
        {['admin', 'operador'].includes(usuario?.rol) && (
          <Link to="/pedidos/nuevo">
            <Button>
              <Plus size={18} />
              Nuevo Pedido
            </Button>
          </Link>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <StatCard key={kpi.title} title={kpi.title} value={kpi.value} icon={kpi.icon} color={kpi.color} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart – Tendencia */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Pedidos por Mes (6 meses)</h3>
          {tendencia.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={tendencia}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 13 }} />
                <Bar dataKey="total" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 py-12 text-center">Sin datos disponibles</p>
          )}
        </div>

        {/* Pie chart – Categorías */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Pedidos por Categoría</h3>
          {porCategoria.length ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={240}>
                <PieChart>
                  <Pie
                    data={porCategoria}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {porCategoria.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {porCategoria.map((c, i) => (
                  <div key={c.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                      <span className="text-gray-600 truncate">{c.name}</span>
                    </div>
                    <span className="font-semibold text-gray-800">{c.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-12 text-center">Sin datos disponibles</p>
          )}
        </div>
      </div>

      {/* Recent + Urgents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Actividad Reciente</h3>
            <Link to="/pedidos" className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1">
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
          {stats?.actividad_reciente?.length ? (
            <div className="space-y-3">
              {stats.actividad_reciente.slice(0, 5).map((a) => (
                <Link
                  key={a.id}
                  to={`/pedidos/${a.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{a.codigo || a.titulo}</p>
                    <p className="text-xs text-gray-500">
                      {a.titulo || ''} {a.total ? `• ${formatCurrency(a.total)}` : ''}
                    </p>
                  </div>
                  <EstadoBadge estado={a.estado} size="sm" />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-8 text-center">Sin actividad reciente</p>
          )}
        </div>

        {/* Urgent Orders */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-amber-500" />
            <h3 className="text-sm font-semibold text-gray-700">Pedidos Urgentes</h3>
          </div>
          {stats?.pedidos_urgentes?.length ? (
            <div className="space-y-3">
              {stats.pedidos_urgentes.slice(0, 5).map((p) => (
                <Link
                  key={p.id}
                  to={`/pedidos/${p.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-amber-50 hover:bg-amber-100/80 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-amber-900 truncate">{p.codigo}</p>
                    <p className="text-xs text-amber-700">{p.titulo}</p>
                  </div>
                  <span className="text-xs font-semibold text-amber-600 bg-amber-200/60 px-2 py-1 rounded-lg">
                    Urgente
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-8 text-center">Sin pedidos urgentes</p>
          )}
        </div>
      </div>
    </div>
  );
}
