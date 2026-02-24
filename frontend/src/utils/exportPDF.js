import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatDate, formatCurrency } from './formatters';

export function exportarPedidosPDF(pedidos, filtros = {}) {
  const doc = new jsPDF({ orientation: 'landscape' });

  doc.setFontSize(18);
  doc.setTextColor(27, 79, 114);
  doc.text('SisPedidos - Reporte de Pedidos', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 14, 28);

  const headers = [['Código', 'Título', 'Tipo', 'Estado', 'Prioridad', 'Solicitante', 'Fecha Req.', 'Monto']];
  const data = pedidos.map((p) => [
    p.codigo,
    p.titulo?.substring(0, 30),
    p.tipo,
    p.estado,
    p.prioridad,
    p.solicitante?.nombre || '-',
    formatDate(p.fecha_requerida),
    formatCurrency(p.total),
  ]);

  doc.autoTable({
    head: headers,
    body: data,
    startY: 35,
    theme: 'grid',
    headStyles: { fillColor: [27, 79, 114], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 249, 250] },
  });

  doc.save('reporte-pedidos.pdf');
}

export function exportarDetallePDF(pedido) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setTextColor(27, 79, 114);
  doc.text(`Pedido: ${pedido.codigo}`, 14, 20);

  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text(pedido.titulo, 14, 30);

  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(`Estado: ${pedido.estado} | Prioridad: ${pedido.prioridad}`, 14, 40);
  doc.text(`Tipo: ${pedido.tipo} | Fecha requerida: ${formatDate(pedido.fecha_requerida)}`, 14, 47);
  doc.text(`Solicitante: ${pedido.solicitante?.nombre || '-'}`, 14, 54);

  if (pedido.items?.length) {
    const headers = [['Descripción', 'Cantidad', 'Unidad', 'P. Unitario', 'Subtotal']];
    const data = pedido.items.map((i) => [
      i.descripcion,
      i.cantidad,
      i.unidad,
      formatCurrency(i.precio_unitario),
      formatCurrency(i.subtotal),
    ]);

    doc.autoTable({
      head: headers,
      body: data,
      startY: 65,
      theme: 'grid',
      headStyles: { fillColor: [27, 79, 114] },
      bodyStyles: { fontSize: 9 },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.text(`Subtotal: ${formatCurrency(pedido.subtotal)}`, 140, finalY);
    doc.text(`Impuesto: ${formatCurrency(pedido.impuesto)}`, 140, finalY + 7);
    doc.setFontSize(13);
    doc.setTextColor(27, 79, 114);
    doc.text(`Total: ${formatCurrency(pedido.total)}`, 140, finalY + 16);
  }

  doc.save(`pedido-${pedido.codigo}.pdf`);
}

// Aliases for page imports
export const exportPedidoPDF = exportarDetallePDF;
export const exportReportePDF = exportarPedidosPDF;
