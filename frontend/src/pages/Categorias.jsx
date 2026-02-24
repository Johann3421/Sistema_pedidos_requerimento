import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus, Edit, Tag, ToggleLeft, ToggleRight, Package, ShoppingCart, Wrench, MonitorSmartphone,
  Utensils, Briefcase, BookOpen, Heart, Star, Zap, Globe, Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCategorias, useCrearCategoria, useActualizarCategoria, useToggleCategoria } from '../hooks/useProveedores';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import EmptyState from '../components/ui/EmptyState';

const ICONS_MAP = {
  Package, ShoppingCart, Wrench, MonitorSmartphone, Utensils,
  Briefcase, BookOpen, Heart, Star, Zap, Globe, Shield, Tag,
};

const ICON_OPTIONS = Object.keys(ICONS_MAP);

const COLORS = [
  { value: '#3b82f6', label: 'Azul' },
  { value: '#10b981', label: 'Verde' },
  { value: '#f59e0b', label: 'Ámbar' },
  { value: '#ef4444', label: 'Rojo' },
  { value: '#8b5cf6', label: 'Violeta' },
  { value: '#ec4899', label: 'Rosa' },
  { value: '#06b6d4', label: 'Cian' },
  { value: '#f97316', label: 'Naranja' },
];

const schema = z.object({
  nombre: z.string().min(2, 'Nombre es requerido'),
  descripcion: z.string().optional(),
  icono: z.string().default('Tag'),
  color: z.string().default('#3b82f6'),
});

export default function Categorias() {
  const { data: categorias, isLoading } = useCategorias();
  const crearCategoria = useCrearCategoria();
  const actualizarCategoria = useActualizarCategoria();
  const toggleCategoria = useToggleCategoria();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { icono: 'Tag', color: '#3b82f6' },
  });

  const selectedIcon = watch('icono');
  const selectedColor = watch('color');

  const openCreate = () => {
    setEditing(null);
    reset({ nombre: '', descripcion: '', icono: 'Tag', color: '#3b82f6' });
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    reset({
      nombre: cat.nombre || '',
      descripcion: cat.descripcion || '',
      icono: cat.icono || 'Tag',
      color: cat.color || '#3b82f6',
    });
    setShowModal(true);
  };

  const onSubmit = (data) => {
    if (editing) {
      actualizarCategoria.mutate({ id: editing.id, data }, {
        onSuccess: () => setShowModal(false),
        onError: (e) => toast.error(e.response?.data?.mensaje || 'Error'),
      });
    } else {
      crearCategoria.mutate(data, {
        onSuccess: () => setShowModal(false),
        onError: (e) => toast.error(e.response?.data?.mensaje || 'Error'),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonLoader className="h-10 w-60" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <SkeletonLoader key={i} className="h-32 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Categorías</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de categorías de productos</p>
        </div>
        <Button onClick={openCreate}><Plus size={18} /> Nueva Categoría</Button>
      </div>

      {!(categorias || []).length ? (
        <EmptyState title="Sin categorías" description="No hay categorías registradas." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(categorias || []).map((cat) => {
            const IconComponent = ICONS_MAP[cat.icono] || Tag;
            const color = cat.color || '#3b82f6';
            return (
              <div
                key={cat.id}
                className={`bg-white rounded-2xl p-5 shadow-sm border transition-all hover:shadow-md ${
                  cat.activo ? 'border-gray-100' : 'border-red-100 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${color}15`, color }}
                  >
                    <IconComponent size={20} />
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-500">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => toggleCategoria.mutate(cat.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-amber-500">
                      {cat.activo ? <ToggleRight size={16} className="text-green-500" /> : <ToggleLeft size={16} />}
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-800 text-sm">{cat.nombre}</h3>
                {cat.descripcion && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{cat.descripcion}</p>}
                {!cat.activo && <p className="text-xs text-red-500 font-medium mt-2">Inactiva</p>}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar Categoría' : 'Nueva Categoría'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input {...register('nombre')} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea rows={2} {...register('descripcion')} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>

          {/* Icon selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Icono</label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((iconName) => {
                const Ic = ICONS_MAP[iconName];
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setValue('icono', iconName)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                      selectedIcon === iconName
                        ? 'ring-2 ring-primary bg-primary/10 text-primary'
                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    <Ic size={16} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setValue('color', c.value)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    selectedColor === c.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" loading={crearCategoria.isPending || actualizarCategoria.isPending}>
              {editing ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
