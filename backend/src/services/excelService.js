const ExcelJS = require('exceljs');

const COLORES = {
  entidad: { primary: '1B4F72' },
  tienda: { primary: '1D6A5A' },
};

const ESTADO_COLORES = {
  completado: '27AE60',
  pendiente: 'F39C12',
  aprobado: '2E86C1',
  rechazado: 'E74C3C',
  en_proceso: '8E44AD',
  borrador: '95A5A6',
  cancelado: '7F8C8D',
};

async function generarReporteExcel(res, { pedidos, filtros, tipoEntidad, totales }) {
  const color = COLORES[tipoEntidad] || COLORES.entidad;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SisPedidos';

  const now = new Date();
  const mesAnio = now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const sheet = workbook.addWorksheet(`Pedidos - ${mesAnio}`);

  // Row 1: Title
  sheet.mergeCells('A1:H1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'Reporte de Pedidos - SisPedidos';
  titleCell.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${color.primary}` } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(1).height = 35;

  // Row 2: Filters
  sheet.mergeCells('A2:H2');
  const filterCell = sheet.getCell('A2');
  const filtroTexts = [];
  if (filtros.fecha_desde) filtroTexts.push(`Desde: ${filtros.fecha_desde}`);
  if (filtros.fecha_hasta) filtroTexts.push(`Hasta: ${filtros.fecha_hasta}`);
  if (filtros.estado) filtroTexts.push(`Estado: ${filtros.estado}`);
  if (filtros.tipo_entidad) filtroTexts.push(`Tipo: ${filtros.tipo_entidad}`);
  filterCell.value = filtroTexts.length ? `Filtros: ${filtroTexts.join(' | ')}` : `Generado: ${now.toLocaleString('es-ES')}`;
  filterCell.font = { italic: true, size: 10, color: { argb: 'FF888888' } };

  // Row 3: empty
  sheet.getRow(3).height = 10;

  // Row 4: Headers
  const headers = ['Código', 'Título', 'Tipo', 'Estado', 'Prioridad', 'Solicitante', 'Fecha Req.', 'Monto Total'];
  const headerRow = sheet.getRow(4);
  headers.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${color.primary}` } };
    cell.border = {
      top: { style: 'thin' }, bottom: { style: 'thin' },
      left: { style: 'thin' }, right: { style: 'thin' },
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  headerRow.height = 25;

  // Data rows
  pedidos.forEach((p, idx) => {
    const row = sheet.getRow(5 + idx);
    row.getCell(1).value = p.codigo;
    row.getCell(2).value = p.titulo;
    row.getCell(3).value = p.tipo;
    row.getCell(4).value = p.estado;
    row.getCell(5).value = p.prioridad;
    row.getCell(6).value = p.solicitante?.nombre || '-';
    row.getCell(7).value = p.fecha_requerida || '-';
    row.getCell(8).value = parseFloat(p.total || 0);
    row.getCell(8).numFmt = '$#,##0.00';
    row.getCell(8).alignment = { horizontal: 'right' };

    // Estado color
    const estadoColor = ESTADO_COLORES[p.estado] || '333333';
    row.getCell(4).font = { color: { argb: `FF${estadoColor}` }, bold: true };

    // Alternating rows
    const bgColor = idx % 2 === 0 ? 'FFFFFFFF' : 'FFF2F2F2';
    for (let c = 1; c <= 8; c++) {
      row.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
      row.getCell(c).border = {
        top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
      };
    }
  });

  // Total row
  const totalRowNum = 5 + pedidos.length;
  const totalRow = sheet.getRow(totalRowNum);
  totalRow.getCell(1).value = 'TOTAL';
  totalRow.getCell(1).font = { bold: true, size: 11 };
  totalRow.getCell(7).value = `${totales.cantidad} pedidos`;
  totalRow.getCell(7).font = { bold: true };
  totalRow.getCell(8).value = parseFloat(totales.monto || 0);
  totalRow.getCell(8).numFmt = '$#,##0.00';
  totalRow.getCell(8).font = { bold: true, size: 11 };
  totalRow.getCell(8).alignment = { horizontal: 'right' };
  for (let c = 1; c <= 8; c++) {
    totalRow.getCell(c).border = {
      top: { style: 'double' },
      bottom: { style: 'thin' },
    };
  }

  // Column widths
  sheet.columns = [
    { width: 18 }, { width: 35 }, { width: 15 }, { width: 14 },
    { width: 12 }, { width: 22 }, { width: 14 }, { width: 16 },
  ];

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=reporte-pedidos.xlsx');

  await workbook.xlsx.write(res);
  res.end();
}

module.exports = { generarReporteExcel };
