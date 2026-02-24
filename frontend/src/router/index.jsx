import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Pedidos from '../pages/Pedidos';
import NuevoPedido from '../pages/NuevoPedido';
import EditarPedido from '../pages/EditarPedido';
import DetallePedido from '../pages/DetallePedido';
import Usuarios from '../pages/Usuarios';
import Proveedores from '../pages/Proveedores';
import Categorias from '../pages/Categorias';
import Reportes from '../pages/Reportes';
import Perfil from '../pages/Perfil';
import ProtectedRoute from './ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'pedidos', element: <Pedidos /> },
      { path: 'pedidos/nuevo', element: <NuevoPedido /> },
      { path: 'pedidos/:id/editar', element: <EditarPedido /> },
      { path: 'pedidos/:id', element: <DetallePedido /> },
      {
        path: 'usuarios',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <Usuarios />
          </ProtectedRoute>
        ),
      },
      {
        path: 'proveedores',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'aprobador']}>
            <Proveedores />
          </ProtectedRoute>
        ),
      },
      {
        path: 'categorias',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'aprobador']}>
            <Categorias />
          </ProtectedRoute>
        ),
      },
      { path: 'reportes', element: <Reportes /> },
      { path: 'perfil', element: <Perfil /> },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);

export default router;
