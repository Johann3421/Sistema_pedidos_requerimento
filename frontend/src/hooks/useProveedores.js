import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { proveedoresService, categoriasService } from '../services/proveedoresService';

export function useProveedores() {
  return useQuery({
    queryKey: ['proveedores'],
    queryFn: () => proveedoresService.listar().then((r) => r.data.data),
  });
}

export function useCrearProveedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => proveedoresService.crear(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['proveedores'] }); toast.success('Proveedor creado'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Error'),
  });
}

export function useActualizarProveedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => proveedoresService.actualizar(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['proveedores'] }); toast.success('Proveedor actualizado'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Error'),
  });
}

export function useToggleProveedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => proveedoresService.toggleActivo(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['proveedores'] }),
  });
}

export function useCategorias() {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: () => categoriasService.listar().then((r) => r.data.data),
  });
}

export function useCrearCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => categoriasService.crear(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categorias'] }); toast.success('Categoría creada'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Error'),
  });
}

export function useActualizarCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => categoriasService.actualizar(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categorias'] }); toast.success('Categoría actualizada'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Error'),
  });
}

export function useToggleCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => categoriasService.toggleActivo(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categorias'] }),
  });
}
