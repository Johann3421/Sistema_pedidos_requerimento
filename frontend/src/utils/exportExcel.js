import * as XLSX from 'xlsx';
import { formatDate, formatCurrency } from './formatters';

export function exportarPedidosExcel(pedidos, filtros = {}) {
  const data = pedidos.map((p) => ({
    'Código': p.codigo,
    'Título': p.titulo,
    'Tipo': p.tipo,
    'Estado': p.estado,
    'Prioridad': p.prioridad,
    'Solicitante': p.solicitante?.nombre || '-',
    'Fecha Requerida': formatDate(p.fecha_requerida),
    'Monto Total': parseFloat(p.total || 0),
  }));

  const ws = XLSX.utils.json_to_sheet(data);

  // Column widths
  ws['!cols'] = [
    { wch: 18 }, { wch: 35 }, { wch: 15 }, { wch: 14 },
    { wch: 12 }, { wch: 22 }, { wch: 14 }, { wch: 16 },
  ];

  const wb = XLSX.utils.book_new();
  const mes = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  XLSX.utils.book_append_sheet(wb, ws, `Pedidos - ${mes}`);

  XLSX.writeFile(wb, 'reporte-pedidos.xlsx');
}

export function exportarDetalleExcel(pedido) {
  if (!pedido?.items) return;

  const data = pedido.items.map((i) => ({
    'Descripción': i.descripcion,
    'Categoría': i.categoria?.nombre || '-',
    'Cantidad': parseFloat(i.cantidad),
    'Unidad': i.unidad,
    'P. Unitario': parseFloat(i.precio_unitario || 0),
    'Subtotal': parseFloat(i.subtotal || 0),
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Pedido ${pedido.codigo}`);

  XLSX.writeFile(wb, `pedido-${pedido.codigo}.xlsx`);
}

// Aliases for page imports
export const exportPedidosExcel = exportarPedidosExcel;
export const exportReporteExcel = exportarPedidosExcel;
export const exportDetalleExcel = exportarDetalleExcel;
