import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { pedidosService } from '../services/pedidosService';
import { reportesService } from '../services/reportesService';

export function usePedidos(params) {
  return useQuery({
    queryKey: ['pedidos', params],
    queryFn: async () => {
      const r = await pedidosService.listar(params);
      // backend returns { success, data: rows, pagination: { page, limit, total, totalPages } }
      const payload = r.data || {};
      const pagination = payload.pagination || {};
      return {
        pedidos: payload.data || [],
        paginacion: {
          page: pagination.page || 1,
          limit: pagination.limit || (params?.limit || 10),
          total: pagination.total || 0,
          total_paginas: pagination.totalPages || Math.ceil((pagination.total || 0) / (pagination.limit || (params?.limit || 10))),
        },
      };
    },
  });
}

export function usePedido(id) {
  return useQuery({
    queryKey: ['pedido', id],
    queryFn: () => pedidosService.obtener(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useEstadisticas() {
  return useQuery({
    queryKey: ['estadisticas'],
    queryFn: () => reportesService.estadisticas().then((r) => r.data.data),
  });
}

export function useCrearPedido() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => pedidosService.crear(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pedidos'] });
      toast.success('Pedido creado correctamente');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Error al crear pedido'),
  });
}

export function useActualizarPedido() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => pedidosService.actualizar(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pedidos'] });
      qc.invalidateQueries({ queryKey: ['pedido'] });
      toast.success('Pedido actualizado correctamente');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Error al actualizar'),
  });
}

export function useCambiarEstado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => pedidosService.cambiarEstado(id, data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['pedidos'] });
      qc.invalidateQueries({ queryKey: ['pedido'] });
      toast.success(res.data.message);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Error al cambiar estado'),
  });
}

export function useEliminarPedido() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => pedidosService.eliminar(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pedidos'] });
      toast.success('Pedido eliminado');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Error al eliminar'),
  });
}

export function useHistorial(id) {
  return useQuery({
    queryKey: ['pedido-historial', id],
    queryFn: () => pedidosService.historial(id).then((r) => r.data.data),
    enabled: !!id,
  });
}
