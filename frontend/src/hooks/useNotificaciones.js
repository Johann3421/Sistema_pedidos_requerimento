import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificacionesService } from '../services/proveedoresService';

export function useNotificaciones() {
  return useQuery({
    queryKey: ['notificaciones'],
    // backend returns { success, data: [...], noLeidas }
    // map to the inner `data` array so components receive an array
    queryFn: async () => {
      const r = await notificacionesService.listar();
      return r.data.data;
    },
    refetchInterval: 30000,
  });
}

export function useMarcarLeida() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => notificacionesService.marcarLeida(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notificaciones'] }),
  });
}

export function useMarcarTodasLeidas() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificacionesService.marcarTodasLeidas(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notificaciones'] }),
  });
}
