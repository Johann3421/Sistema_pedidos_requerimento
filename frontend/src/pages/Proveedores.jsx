import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit, Truck, Phone, Mail, MapPin, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useProveedores, useCrearProveedor, useActualizarProveedor, useToggleProveedor } from '../hooks/useProveedores';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import EmptyState from '../components/ui/EmptyState';

const schema = z.object({
  nombre: z.string().min(2, 'Nombre es requerido'),
  ruc: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  contacto_nombre: z.string().optional(),
  contacto_telefono: z.string().optional(),
});

export default function Proveedores() {
  const { data: proveedores, isLoading } = useProveedores();
  const crearProveedor = useCrearProveedor();
  const actualizarProveedor = useActualizarProveedor();
  const toggleProveedor = useToggleProveedor();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const openCreate = () => {
    setEditing(null);
    reset({ nombre: '', ruc: '', email: '', telefono: '', direccion: '', contacto_nombre: '', contacto_telefono: '' });
    setShowModal(true);
  };

  const openEdit = (prov) => {
    setEditing(prov);
    reset({
      nombre: prov.nombre || '',
      ruc: prov.ruc || '',
      email: prov.email || '',
      telefono: prov.telefono || '',
      direccion: prov.direccion || '',
      contacto_nombre: prov.contacto_nombre || '',
      contacto_telefono: prov.contacto_telefono || '',
    });
    setShowModal(true);
  };

  const onSubmit = (data) => {
    if (editing) {
      actualizarProveedor.mutate({ id: editing.id, data }, {
        onSuccess: () => setShowModal(false),
        onError: (e) => toast.error(e.response?.data?.mensaje || 'Error'),
      });
    } else {
      crearProveedor.mutate(data, {
        onSuccess: () => setShowModal(false),
        onError: (e) => toast.error(e.response?.data?.mensaje || 'Error'),
      });
    }
  };

  const handleToggle = (id) => {
    toggleProveedor.mutate(id);
  };

  const filtered = (proveedores || []).filter((p) =>
    p.nombre.toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonLoader className="h-10 w-60" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <SkeletonLoader key={i} className="h-48 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Proveedores</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de proveedores del sistema</p>
        </div>
        <Button onClick={openCreate}><Plus size={18} /> Nuevo Proveedor</Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 shadow-sm border border-gray-100 max-w-md">
        <Truck size={16} className="text-gray-400" />
        <input
          type="text" placeholder="Buscar proveedor..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none outline-none text-sm w-full"
        />
      </div>

      {!filtered.length ? (
        <EmptyState title="Sin proveedores" description="No se encontraron proveedores." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((prov) => (
            <div key={prov.id} className={`bg-white rounded-2xl p-5 shadow-sm border transition-all hover:shadow-md ${prov.activo ? 'border-gray-100' : 'border-red-100 opacity-60'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Truck size={18} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">{prov.nombre}</h3>
                    {prov.ruc && <p className="text-xs text-gray-400">RUC: {prov.ruc}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(prov)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-500">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => handleToggle(prov.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-amber-500">
                    {prov.activo ? <ToggleRight size={16} className="text-green-500" /> : <ToggleLeft size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                {prov.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-gray-400" />
                    <span className="truncate">{prov.email}</span>
                  </div>
                )}
                {prov.telefono && (
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-400" />
                    <span>{prov.telefono}</span>
                  </div>
                )}
                {prov.direccion && (
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-gray-400" />
                    <span className="truncate">{prov.direccion}</span>
                  </div>
                )}
              </div>
              {!prov.activo && (
                <div className="mt-3 text-xs text-red-500 font-medium">Inactivo</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar Proveedor' : 'Nuevo Proveedor'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input {...register('nombre')} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">RUC</label>
              <input {...register('ruc')} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input {...register('telefono')} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" {...register('email')} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
            <input {...register('direccion')} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contacto</label>
              <input {...register('contacto_nombre')} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tel. Contacto</label>
              <input {...register('contacto_telefono')} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" loading={crearProveedor.isPending || actualizarProveedor.isPending}>
              {editing ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
