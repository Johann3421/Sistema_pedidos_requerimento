const { Op, fn, col, literal } = require('sequelize');
const { Pedido, PedidoItem, PedidoHistorial, Usuario, Proveedor, Categoria } = require('../models');
const sequelize = require('../config/database');
const { generarReportePDF } = require('../services/pdfService');
const { generarReporteExcel } = require('../services/excelService');

function buildReportWhere(query, usuario) {
  const where = {};
  const { fecha_desde, fecha_hasta, estado, tipo_entidad, categoria_id, proveedor_id, usuario_id } = query;

  if (usuario.rol === 'operador') {
    where.usuario_id = usuario.id;
  }

  if (estado) {
    where.estado = Array.isArray(estado) ? { [Op.in]: estado } : estado;
  }
  if (tipo_entidad) where.tipo_entidad = tipo_entidad;
  if (proveedor_id) where.proveedor_id = proveedor_id;
  if (usuario_id && usuario.rol !== 'operador') where.usuario_id = usuario_id;

  if (fecha_desde || fecha_hasta) {
    where.created_at = {};
    if (fecha_desde) where.created_at[Op.gte] = new Date(fecha_desde);
    if (fecha_hasta) {
      const hasta = new Date(fecha_hasta);
      hasta.setHours(23, 59, 59, 999);
      where.created_at[Op.lte] = hasta;
    }
  }

  return where;
}

const listar = async (req, res, next) => {
  try {
    const where = buildReportWhere(req.query, req.usuario);
    const { page = 1, limit = 25 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Pedido.findAndCountAll({
      where,
      include: [
        { model: Usuario, as: 'solicitante', attributes: ['id', 'nombre'] },
        { model: Proveedor, as: 'proveedor', attributes: ['id', 'nombre'] },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    const montoTotal = await Pedido.sum('total', { where }) || 0;

    res.json({
      success: true,
      data: rows,
      totales: {
        cantidad: count,
        monto: parseFloat(montoTotal),
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

const estadisticas = async (req, res, next) => {
  try {
    const baseWhere = {};
    if (req.usuario.rol === 'operador') {
      baseWhere.usuario_id = req.usuario.id;
    }

    // KPIs
    const totalPedidos = await Pedido.count({ where: baseWhere });
    const pendientes = await Pedido.count({ where: { ...baseWhere, estado: 'pendiente' } });
    const aprobados = await Pedido.count({ where: { ...baseWhere, estado: 'aprobado' } });
    const rechazados = await Pedido.count({ where: { ...baseWhere, estado: 'rechazado' } });

    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const completadosMes = await Pedido.count({
      where: {
        ...baseWhere,
        estado: 'completado',
        updated_at: { [Op.gte]: inicioMes },
      },
    });

    const montoMes = await Pedido.sum('total', {
      where: {
        ...baseWhere,
        estado: { [Op.in]: ['completado', 'aprobado'] },
        updated_at: { [Op.gte]: inicioMes },
      },
    }) || 0;

    // Tendencia últimos 6 meses
    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);

    const tendencia = await Pedido.findAll({
      attributes: [
        [fn('DATE_FORMAT', col('created_at'), '%Y-%m'), 'mes'],
        [fn('COUNT', col('id')), 'total'],
        'estado',
      ],
      where: {
        ...baseWhere,
        created_at: { [Op.gte]: seisMesesAtras },
      },
      group: [literal("DATE_FORMAT(created_at, '%Y-%m')"), 'estado'],
      raw: true,
    });

    // Por categoría
    const porCategoria = await PedidoItem.findAll({
      attributes: [
        [fn('COUNT', col('PedidoItem.id')), 'cantidad'],
      ],
      include: [{
        model: Categoria,
        as: 'categoria',
        attributes: ['nombre'],
      }],
      group: ['categoria_id'],
      raw: true,
      nest: true,
    });

    // Actividad reciente
    const actividadReciente = await PedidoHistorial.findAll({
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'avatar_url'] },
        { model: Pedido, attributes: ['id', 'codigo', 'titulo'] },
      ],
      order: [['created_at', 'DESC']],
      limit: 8,
    });

    // Pedidos urgentes
    const urgentes = await Pedido.findAll({
      where: {
        ...baseWhere,
        prioridad: 'urgente',
        estado: { [Op.notIn]: ['completado', 'cancelado'] },
      },
      include: [{ model: Usuario, as: 'solicitante', attributes: ['id', 'nombre'] }],
      order: [['created_at', 'DESC']],
      limit: 5,
    });

    res.json({
      success: true,
      data: {
        kpis: {
          totalPedidos,
          total_pedidos: totalPedidos,
          pendientes,
          aprobados,
          rechazados,
          completadosMes,
          montoMes: parseFloat(montoMes),
        },
        tendencia,
        porCategoria,
        actividadReciente,
        urgentes,
      },
    });
  } catch (error) {
    next(error);
  }
};

const exportarPDF = async (req, res, next) => {
  try {
    const where = buildReportWhere(req.query, req.usuario);
    const pedidos = await Pedido.findAll({
      where,
      include: [{ model: Usuario, as: 'solicitante', attributes: ['id', 'nombre'] }],
      order: [['created_at', 'DESC']],
    });
    const monto = pedidos.reduce((sum, p) => sum + parseFloat(p.total || 0), 0);
    generarReportePDF(res, {
      pedidos, filtros: req.query,
      tipoEntidad: req.usuario.tipo_entidad,
      totales: { cantidad: pedidos.length, monto },
    });
  } catch (error) {
    next(error);
  }
};

const exportarExcel = async (req, res, next) => {
  try {
    const where = buildReportWhere(req.query, req.usuario);
    const pedidos = await Pedido.findAll({
      where,
      include: [{ model: Usuario, as: 'solicitante', attributes: ['id', 'nombre'] }],
      order: [['created_at', 'DESC']],
    });
    const monto = pedidos.reduce((sum, p) => sum + parseFloat(p.total || 0), 0);
    await generarReporteExcel(res, {
      pedidos, filtros: req.query,
      tipoEntidad: req.usuario.tipo_entidad,
      totales: { cantidad: pedidos.length, monto },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { listar, estadisticas, exportarPDF, exportarExcel };
