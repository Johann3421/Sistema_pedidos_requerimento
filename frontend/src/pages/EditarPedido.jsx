import { useParams } from 'react-router-dom';
import { usePedido } from '../hooks/usePedidos';
import PedidoForm from '../components/pedidos/PedidoForm';
import Spinner from '../components/ui/Spinner';

export default function EditarPedido() {
  const { id } = useParams();
  const { data: pedido, isLoading } = usePedido(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Pedido no encontrado</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">Editar Pedido</h1>
        <p className="text-gray-500 text-sm mt-1">Modificar pedido {pedido.codigo}</p>
      </div>
      <PedidoForm pedido={pedido} />
    </div>
  );
}
