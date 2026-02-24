import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Lock, Camera, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { updateProfile, changePassword } from '../services/authService';
import Button from '../components/ui/Button';

const profileSchema = z.object({
  nombre: z.string().min(2, 'Nombre es requerido'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Contraseña actual es requerida'),
  newPassword: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmar contraseña'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export default function Perfil() {
  const { usuario, setAuth } = useAuthStore();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { nombre: usuario?.nombre || '' },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onProfileSubmit = async (data) => {
    setProfileLoading(true);
    try {
      const res = await updateProfile(data);
      const token = useAuthStore.getState().token;
      setAuth(token, { ...usuario, ...res.data?.data });
      toast.success('Perfil actualizado');
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al actualizar perfil');
    } finally {
      setProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    setPasswordLoading(true);
    try {
      await changePassword({
        password_actual: data.currentPassword,
        password_nuevo: data.newPassword,
      });
      toast.success('Contraseña actualizada');
      passwordForm.reset();
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al cambiar contraseña');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-500 text-sm mt-1">Gestiona tu información personal</p>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Hero */}
        <div className="h-24 bg-gradient-to-r from-primary to-primary/70" />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-10 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center text-2xl font-bold text-primary border-4 border-white">
              {usuario?.nombre?.charAt(0)?.toUpperCase()}
            </div>
            <div className="pb-1">
              <h2 className="text-lg font-bold text-gray-900">{usuario?.nombre}</h2>
              <p className="text-sm text-gray-500">{usuario?.email} • <span className="capitalize">{usuario?.rol}</span> • <span className="capitalize">{usuario?.tipo_entidad}</span></p>
            </div>
          </div>

          {/* Profile form */}
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
              <input
                {...profileForm.register('nombre')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
              {profileForm.formState.errors.nombre && (
                <p className="text-red-500 text-xs mt-1">{profileForm.formState.errors.nombre.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={usuario?.email || ''}
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <input value={usuario?.rol || ''} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500 capitalize" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Entidad</label>
                <input value={usuario?.tipo_entidad || ''} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500 capitalize" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" loading={profileLoading}>
                <Save size={16} /> Guardar Cambios
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={18} className="text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-700">Cambiar Contraseña</h3>
        </div>
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña actual</label>
            <input
              type="password"
              {...passwordForm.register('currentPassword')}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
            {passwordForm.formState.errors.currentPassword && (
              <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
              <input
                type="password"
                {...passwordForm.register('newPassword')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
              <input
                type="password"
                {...passwordForm.register('confirmPassword')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={passwordLoading}>
              <Lock size={16} /> Cambiar Contraseña
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
