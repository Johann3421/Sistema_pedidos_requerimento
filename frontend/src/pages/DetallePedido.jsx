import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Edit, Trash2, CheckCircle, XCircle, Truck, Package,
  FileText, Download, Clock, DollarSign, User, Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { usePedido, useCambiarEstado, useEliminarPedido, useHistorial } from '../hooks/usePedidos';
import useAuthStore from '../store/authStore';
import Button from '../components/ui/Button';
import EstadoBadge from '../components/pedidos/EstadoBadge';
import PedidoTimeline from '../components/pedidos/PedidoTimeline';
import ItemsTable from '../components/pedidos/ItemsTable';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';
import { ESTADOS } from '../utils/constants';
import { exportPedidoPDF } from '../utils/exportPDF';

const TRANSICIONES = {
  borrador: ['pendiente'],
  pendiente: ['aprobado', 'rechazado'],
  aprobado: ['en_proceso'],
  en_proceso: ['completado'],
};

export default function DetallePedido() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuthStore();
  const { data: pedido, isLoading } = usePedido(id);
  const { data: historial } = useHistorial(id);
  const cambiarEstado = useCambiarEstado();
  const eliminarPedido = useEliminarPedido();

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showEstadoModal, setShowEstadoModal] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [comentario, setComentario] = useState('');

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;
  }

  if (!pedido) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Pedido no encontrado</p>
        <Link to="/pedidos" className="text-primary text-sm hover:underline mt-2 inline-block">Volver a pedidos</Link>
      </div>
    );
  }

  const estadosDisponibles = TRANSICIONES[pedido.estado] || [];

  const puedeEditar = ['admin', 'operador'].includes(usuario?.rol) && ['borrador', 'pendiente'].includes(pedido.estado);

  const puedeCambiarEstado = (() => {
    if (usuario?.rol === 'admin') return estadosDisponibles.length > 0;
    if (usuario?.rol === 'aprobador' && ['pendiente'].includes(pedido.estado)) return true;
    if (usuario?.rol === 'operador' && ['borrador', 'aprobado', 'en_proceso'].includes(pedido.estado)) return true;
    return false;
  })();

  const puedeEliminar = usuario?.rol === 'admin' || (usuario?.rol === 'operador' && pedido.estado === 'borrador');

  const handleCambiarEstado = () => {
    if (!nuevoEstado) return;
    cambiarEstado.mutate(
      { id: pedido.id, data: { estado: nuevoEstado, comentario } },
      {
        onSuccess: () => {
          toast.success(`Estado cambiado a ${ESTADOS[nuevoEstado]?.label || nuevoEstado}`);
          setShowEstadoModal(false);
          setComentario('');
          setNuevoEstado('');
        },
        onError: (err) => toast.error(err.response?.data?.mensaje || 'Error al cambiar estado'),
      },
    );
  };

  const handleEliminar = () => {
    eliminarPedido.mutate(pedido.id, {
      onSuccess: () => {
        toast.success('Pedido eliminado');
        navigate('/pedidos');
      },
      onError: (err) => toast.error(err.response?.data?.mensaje || 'Error al eliminar'),
    });
  };

  const handleExportPDF = () => {
    exportPedidoPDF(pedido);
  };

  const estadoActionsMap = {
    aprobado: { label: 'Aprobar', icon: CheckCircle, color: 'bg-green-500 hover:bg-green-600' },
    rechazado: { label: 'Rechazar', icon: XCircle, color: 'bg-red-500 hover:bg-red-600' },
    en_proceso: { label: 'En Proceso', icon: Truck, color: 'bg-blue-500 hover:bg-blue-600' },
    completado: { label: 'Completar', icon: Package, color: 'bg-emerald-500 hover:bg-emerald-600' },
    pendiente: { label: 'Enviar', icon: FileText, color: 'bg-amber-500 hover:bg-amber-600' },
  };

  return (
    <div className="animate-fade-in">
      {/* Back + Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-display font-bold text-gray-900">{pedido.codigo}</h1>
              <EstadoBadge estado={pedido.estado} />
            </div>
            <p className="text-gray-500 text-sm mt-0.5">{pedido.titulo}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <Download size={16} /> PDF
          </Button>
          {puedeEditar && (
            <Link to={`/pedidos/${pedido.id}/editar`}>
              <Button variant="outline" size="sm">
                <Edit size={16} /> Editar
              </Button>
            </Link>
          )}
          {puedeEliminar && (
            <Button variant="danger" size="sm" onClick={() => setShowConfirmDelete(true)}>
              <Trash2 size={16} /> Eliminar
            </Button>
          )}
        </div>
      </div>

      {/* Main layout: 70/30 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left – Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Información General</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem icon={FileText} label="Tipo" value={pedido.tipo} capitalize />
              <InfoItem icon={Clock} label="Prioridad" value={pedido.prioridad} capitalize />
              <InfoItem icon={Calendar} label="Fecha necesaria" value={pedido.fecha_requerida ? formatDate(pedido.fecha_requerida) : 'Sin especificar'} />
              <InfoItem icon={User} label="Solicitante" value={pedido.solicitante?.nombre || 'N/A'} />
              <InfoItem icon={Truck} label="Proveedor" value={pedido.proveedor?.nombre || 'Sin proveedor'} />
              <InfoItem icon={DollarSign} label="Total" value={formatCurrency(pedido.total, pedido.moneda)} />
            </div>
            {pedido.descripcion && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-1">Descripción</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{pedido.descripcion}</p>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Ítems del Pedido</h3>
            <ItemsTable items={pedido.items || []} readOnly />
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
              <div className="space-y-1 text-right">
                <div className="flex justify-between gap-8 text-sm">
                  <span className="text-gray-500">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(pedido.subtotal)}</span>
                </div>
                <div className="flex justify-between gap-8 text-sm">
                  <span className="text-gray-500">Impuestos:</span>
                  <span className="font-medium">{formatCurrency(pedido.impuesto)}</span>
                </div>
                <div className="flex justify-between gap-8 text-base font-bold">
                  <span className="text-gray-700">Total:</span>
                  <span className="text-primary">{formatCurrency(pedido.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right – Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          {puedeCambiarEstado && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Acciones</h3>
              <div className="space-y-2">
                {estadosDisponibles
                  .filter((est) => {
                    if (usuario?.rol === 'aprobador') return ['aprobado', 'rechazado'].includes(est);
                    if (usuario?.rol === 'operador') return ['pendiente', 'en_proceso', 'completado'].includes(est);
                    return true;
                  })
                  .map((est) => {
                    const action = estadoActionsMap[est];
                    if (!action) return null;
                    return (
                      <button
                        key={est}
                        onClick={() => {
                          setNuevoEstado(est);
                          setShowEstadoModal(true);
                        }}
                        className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-colors ${action.color}`}
                      >
                        <action.icon size={16} />
                        {action.label}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Historial</h3>
            <PedidoTimeline historial={historial || []} />
          </div>
        </div>
      </div>

      {/* Estado Change Modal */}
      <Modal
        isOpen={showEstadoModal}
        onClose={() => { setShowEstadoModal(false); setComentario(''); }}
        title={`Cambiar estado a: ${ESTADOS[nuevoEstado]?.label || nuevoEstado}`}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comentario (opcional)</label>
            <textarea
              rows={3}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="Agregar un comentario..."
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowEstadoModal(false)}>Cancelar</Button>
            <Button onClick={handleCambiarEstado} loading={cambiarEstado.isPending}>
              Confirmar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleEliminar}
        title="Eliminar pedido"
        message={`¿Está seguro de eliminar el pedido ${pedido.codigo}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        loading={eliminarPedido.isPending}
      />
    </div>
  );
}

function InfoItem({ icon: Icon, label, value, capitalize }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
        <Icon size={15} className="text-gray-400" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`text-sm font-medium text-gray-800 ${capitalize ? 'capitalize' : ''}`}>{value}</p>
      </div>
    </div>
  );
}
