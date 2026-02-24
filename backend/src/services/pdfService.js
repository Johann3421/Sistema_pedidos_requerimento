const PDFDocument = require('pdfkit');

const COLORES = {
  entidad: { primary: '#1B4F72', accent: '#2E86C1' },
  tienda: { primary: '#1D6A5A', accent: '#27AE60' },
};

function generarReportePDF(res, { pedidos, filtros, tipoEntidad, totales }) {
  const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
  const color = COLORES[tipoEntidad] || COLORES.entidad;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=reporte-pedidos.pdf');
  doc.pipe(res);

  // Header
  doc.fontSize(20).font('Helvetica-Bold').fillColor(color.primary)
    .text('SisPedidos', 40, 30);
  doc.fontSize(14).font('Helvetica').fillColor('#333')
    .text('Reporte de Pedidos', 40, 55);
  doc.fontSize(9).fillColor('#888')
    .text(`Generado: ${new Date().toLocaleString('es-ES')}`, 550, 35, { align: 'right' });

  // Separator
  doc.moveTo(40, 80).lineTo(760, 80).strokeColor(color.primary).lineWidth(2).stroke();

  // Filtros
  let y = 90;
  if (filtros && Object.keys(filtros).length > 0) {
    doc.fontSize(8).fillColor('#888').text(`Filtros: ${JSON.stringify(filtros)}`, 40, y);
    y += 15;
  }

  // Table header
  y += 5;
  const cols = [40, 110, 230, 330, 400, 470, 560, 660];
  const headers = ['Código', 'Título', 'Tipo', 'Estado', 'Prioridad', 'Solicitante', 'Fecha Req.', 'Monto'];

  doc.rect(38, y - 3, 722, 20).fill(color.primary);
  doc.fontSize(8).font('Helvetica-Bold').fillColor('#FFFFFF');
  headers.forEach((h, i) => doc.text(h, cols[i], y, { width: 90 }));
  y += 22;

  // Table rows
  doc.font('Helvetica').fillColor('#333');
  let alt = false;
  for (const p of pedidos) {
    if (y > 540) {
      doc.addPage({ layout: 'landscape' });
      y = 40;
    }
    if (alt) {
      doc.rect(38, y - 3, 722, 18).fill('#F8F9FA');
      doc.fillColor('#333');
    }
    alt = !alt;
    doc.fontSize(7);
    doc.text(p.codigo || '', cols[0], y, { width: 70 });
    doc.text((p.titulo || '').substring(0, 30), cols[1], y, { width: 120 });
    doc.text(p.tipo || '', cols[2], y, { width: 60 });
    doc.text(p.estado || '', cols[3], y, { width: 70 });
    doc.text(p.prioridad || '', cols[4], y, { width: 60 });
    doc.text(p.solicitante?.nombre || '', cols[5], y, { width: 90 });
    doc.text(p.fecha_requerida || '', cols[6], y, { width: 70 });
    doc.text(`$${parseFloat(p.total || 0).toFixed(2)}`, cols[7], y, { width: 70 });
    y += 18;
  }

  // Totals
  y += 5;
  doc.moveTo(38, y).lineTo(760, y).strokeColor('#333').lineWidth(1).stroke();
  y += 8;
  doc.font('Helvetica-Bold').fontSize(9);
  doc.text(`Total de pedidos: ${totales.cantidad}`, cols[0], y);
  doc.text(`Monto total: $${parseFloat(totales.monto || 0).toFixed(2)}`, cols[5], y);

  // Footer
  const pageCount = doc.bufferedPageRange();
  doc.fontSize(7).font('Helvetica').fillColor('#999');
  doc.text('SisPedidos - Sistema de Pedidos y Requerimientos', 40, 570);

  doc.end();
}

function generarDetallePDF(res, { pedido, items, historial, tipoEntidad }) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const color = COLORES[tipoEntidad] || COLORES.entidad;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=pedido-${pedido.codigo}.pdf`);
  doc.pipe(res);

  // Header
  doc.fontSize(20).font('Helvetica-Bold').fillColor(color.primary)
    .text('SisPedidos', 40, 30);
  doc.fontSize(12).fillColor('#333')
    .text(`Pedido: ${pedido.codigo}`, 40, 55);
  doc.fontSize(16).font('Helvetica-Bold')
    .text(pedido.titulo, 40, 75);

  doc.moveTo(40, 100).lineTo(555, 100).strokeColor(color.primary).lineWidth(2).stroke();

  // General info
  let y = 115;
  doc.fontSize(9).font('Helvetica').fillColor('#555');
  const infoLeft = [
    `Tipo: ${pedido.tipo}`,
    `Estado: ${pedido.estado}`,
    `Prioridad: ${pedido.prioridad}`,
    `Fecha requerida: ${pedido.fecha_requerida || 'No especificada'}`,
  ];
  const infoRight = [
    `Solicitante: ${pedido.solicitante?.nombre || '-'}`,
    `Proveedor: ${pedido.proveedor?.nombre || 'No asignado'}`,
    `Creado: ${new Date(pedido.created_at).toLocaleDateString('es-ES')}`,
  ];
  infoLeft.forEach((t, i) => doc.text(t, 40, y + i * 15));
  infoRight.forEach((t, i) => doc.text(t, 300, y + i * 15));

  // Items table
  y += 80;
  doc.fontSize(12).font('Helvetica-Bold').fillColor(color.primary).text('Ítems del Pedido', 40, y);
  y += 20;

  const itemCols = [40, 200, 300, 370, 440, 500];
  const itemHeaders = ['Descripción', 'Categoría', 'Cantidad', 'Unidad', 'P. Unit.', 'Subtotal'];

  doc.rect(38, y - 3, 517, 18).fill(color.primary);
  doc.fontSize(8).font('Helvetica-Bold').fillColor('#FFF');
  itemHeaders.forEach((h, i) => doc.text(h, itemCols[i], y, { width: 80 }));
  y += 20;

  doc.font('Helvetica').fillColor('#333');
  for (const item of items) {
    if (y > 720) { doc.addPage(); y = 40; }
    doc.fontSize(8);
    doc.text((item.descripcion || '').substring(0, 35), itemCols[0], y, { width: 155 });
    doc.text(item.categoria?.nombre || '-', itemCols[1], y, { width: 95 });
    doc.text(String(item.cantidad), itemCols[2], y, { width: 65 });
    doc.text(item.unidad || 'unidad', itemCols[3], y, { width: 65 });
    doc.text(`$${parseFloat(item.precio_unitario || 0).toFixed(2)}`, itemCols[4], y, { width: 55 });
    doc.text(`$${parseFloat(item.subtotal || 0).toFixed(2)}`, itemCols[5], y, { width: 55 });
    y += 16;
  }

  // Totals
  y += 5;
  doc.moveTo(400, y).lineTo(555, y).stroke();
  y += 8;
  doc.font('Helvetica-Bold').fontSize(9);
  doc.text(`Subtotal: $${parseFloat(pedido.subtotal || 0).toFixed(2)}`, 400, y);
  y += 14;
  doc.text(`Impuesto: $${parseFloat(pedido.impuesto || 0).toFixed(2)}`, 400, y);
  y += 14;
  doc.fontSize(11).fillColor(color.primary);
  doc.text(`Total: $${parseFloat(pedido.total || 0).toFixed(2)}`, 400, y);

  // Signature lines
  y = 720;
  doc.fontSize(9).fillColor('#333').font('Helvetica');
  doc.moveTo(40, y).lineTo(200, y).stroke();
  doc.moveTo(350, y).lineTo(510, y).stroke();
  doc.text('Solicitante', 90, y + 5);
  doc.text('Aprobado por', 390, y + 5);

  doc.end();
}

module.exports = { generarReportePDF, generarDetallePDF };
