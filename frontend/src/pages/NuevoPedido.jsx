import PedidoForm from '../components/pedidos/PedidoForm';

export default function NuevoPedido() {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">Nuevo Pedido</h1>
        <p className="text-gray-500 text-sm mt-1">Complete los pasos para crear un nuevo pedido</p>
      </div>
      <PedidoForm />
    </div>
  );
}
