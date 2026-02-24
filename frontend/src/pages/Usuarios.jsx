import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit, Trash2, Search, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUsuarios, useCrearUsuario, useActualizarUsuario, useEliminarUsuario } from '../hooks/useUsuarios';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import EmptyState from '../components/ui/EmptyState';
import { ROLES, TIPOS_ENTIDAD } from '../utils/constants';

const schema = z.object({
  nombre: z.string().min(2, 'Nombre es requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres').optional().or(z.literal('')),
  rol: z.enum(['admin', 'aprobador', 'operador', 'visualizador']),
  tipo_entidad: z.enum(['entidad', 'tienda']),
  activo: z.boolean().default(true),
});

export default function Usuarios() {
  const { data: usuarios, isLoading } = useUsuarios();
  const crearUsuario = useCrearUsuario();
  const actualizarUsuario = useActualizarUsuario();
  const eliminarUsuario = useEliminarUsuario();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showDelete, setShowDelete] = useState(null);
  const [search, setSearch] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const openCreate = () => {
    setEditing(null);
    reset({ nombre: '', email: '', password: '', rol: 'operador', tipo_entidad: 'entidad', activo: true });
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    reset({
      nombre: user.nombre,
      email: user.email,
      password: '',
      rol: user.rol,
      tipo_entidad: user.tipo_entidad,
      activo: user.activo,
    });
    setShowModal(true);
  };

  const onSubmit = (data) => {
    const payload = { ...data };
    if (!payload.password) delete payload.password;

    if (editing) {
      actualizarUsuario.mutate({ id: editing.id, data: payload }, {
        onSuccess: () => { toast.success('Usuario actualizado'); setShowModal(false); },
        onError: (e) => toast.error(e.response?.data?.mensaje || 'Error al actualizar'),
      });
    } else {
      if (!payload.password) { toast.error('Contraseña es requerida'); return; }
      crearUsuario.mutate(payload, {
        onSuccess: () => { toast.success('Usuario creado'); setShowModal(false); },
        onError: (e) => toast.error(e.response?.data?.mensaje || 'Error al crear'),
      });
    }
  };

  const handleDelete = () => {
    if (!showDelete) return;
    eliminarUsuario.mutate(showDelete.id, {
      onSuccess: () => { toast.success('Usuario eliminado'); setShowDelete(null); },
      onError: (e) => toast.error(e.response?.data?.mensaje || 'Error al eliminar'),
    });
  };

  const filtered = (usuarios || []).filter((u) =>
    u.nombre.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const rolColor = {
    admin: 'bg-purple-100 text-purple-700',
    aprobador: 'bg-blue-100 text-blue-700',
    operador: 'bg-green-100 text-green-700',
    visualizador: 'bg-gray-100 text-gray-600',
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonLoader className="h-10 w-60" />
        {[...Array(5)].map((_, i) => <SkeletonLoader key={i} className="h-16 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de usuarios del sistema</p>
        </div>
        <Button onClick={openCreate}><Plus size={18} /> Nuevo Usuario</Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 max-w-sm">
            <Search size={16} className="text-gray-400" />
            <input
              type="text" placeholder="Buscar usuario..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>
        </div>

        {!filtered.length ? (
          <EmptyState title="Sin usuarios" description="No se encontraron usuarios." />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase bg-gray-50">
                <th className="px-5 py-3">Usuario</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Rol</th>
                <th className="px-5 py-3">Entidad</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        {user.nombre?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{user.nombre}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{user.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2 py-1 rounded-lg capitalize ${rolColor[user.rol]}`}>
                      {user.rol}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600 capitalize">{user.tipo_entidad}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2 py-1 rounded-lg ${user.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {user.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(user)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-500">
                        <Edit size={15} />
                      </button>
                      <button onClick={() => setShowDelete(user)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar Usuario' : 'Nuevo Usuario'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input {...register('nombre')} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" {...register('email')} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña {editing && <span className="text-gray-400 font-normal">(dejar vacío para no cambiar)</span>}
            </label>
            <input type="password" {...register('password')} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select {...register('rol')} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Entidad</label>
              <select {...register('tipo_entidad')} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                {TIPOS_ENTIDAD.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" {...register('activo')} id="activo" className="rounded" />
            <label htmlFor="activo" className="text-sm text-gray-700">Activo</label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" loading={crearUsuario.isPending || actualizarUsuario.isPending}>
              {editing ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!showDelete}
        onClose={() => setShowDelete(null)}
        onConfirm={handleDelete}
        title="Eliminar usuario"
        message={`¿Está seguro de eliminar a ${showDelete?.nombre}?`}
        confirmLabel="Eliminar"
        variant="danger"
        loading={eliminarUsuario.isPending}
      />
    </div>
  );
}
