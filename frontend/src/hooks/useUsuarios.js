import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { usuariosService } from '../services/usuariosService';

export function useUsuarios() {
  return useQuery({
    queryKey: ['usuarios'],
    queryFn: () => usuariosService.listar().then((r) => r.data.data),
  });
}

export function useUsuario(id) {
  return useQuery({
    queryKey: ['usuarios', id],
    queryFn: () => usuariosService.obtener(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useCrearUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => usuariosService.crear(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['usuarios'] }),
  });
}

export function useActualizarUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => usuariosService.actualizar(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['usuarios'] }),
  });
}

export function useEliminarUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => usuariosService.toggleActivo(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['usuarios'] }),
  });
}
