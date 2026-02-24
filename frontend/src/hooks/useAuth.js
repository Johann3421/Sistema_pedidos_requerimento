import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import useAuthStore from '../store/authStore';

export function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (data) => authService.login(data),
    onSuccess: (res) => {
      const { token, usuario } = res.data.data;
      setAuth(token, usuario);
      toast.success(`Bienvenido, ${usuario.nombre}`);
      navigate('/dashboard');
    },
    onError: (err) => {
      // Error handled inline in the form
    },
  });
}

export function useRegister() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (data) => authService.register(data),
    onSuccess: (res) => {
      const { token, usuario } = res.data.data;
      setAuth(token, usuario);
      toast.success('Cuenta creada exitosamente');
      navigate('/dashboard');
    },
  });
}

export function useCambiarPassword() {
  return useMutation({
    mutationFn: (data) => authService.cambiarPassword(data),
    onSuccess: () => toast.success('Contraseña actualizada correctamente'),
    onError: (err) => toast.error(err.response?.data?.message || 'Error al cambiar contraseña'),
  });
}
