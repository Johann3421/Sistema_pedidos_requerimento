const { Op } = require('sequelize');
const { Pedido, PedidoItem, PedidoHistorial, Usuario, Proveedor, Categoria, Notificacion } = require('../models');
const sequelize = require('../config/database');
const { generarCodigo } = require('../services/codigoService');
const { notificarCambioEstado } = require('../services/notificacionService');
const { generarReportePDF, generarDetallePDF } = require('../services/pdfService');
const { generarReporteExcel } = require('../services/excelService');

async function recalcularTotalesPedido(pedidoId, impuestoPct = null) {
  const items = await PedidoItem.findAll({ where: { pedido_id: pedidoId } });
  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0);

  const pedido = await Pedido.findByPk(pedidoId);
  const pct = impuestoPct !== null ? impuestoPct : (pedido.subtotal > 0 ? (parseFloat(pedido.impuesto) / parseFloat(pedido.subtotal) * 100) : 0);
  const impuesto = subtotal * (pct / 100);
  const total = subtotal + impuesto;

  await Pedido.update({ subtotal, impuesto, total }, { where: { id: pedidoId } });
  return { subtotal, impuesto, total };
}

const listar = async (req, res, next) => {
  try {
    const { estado, tipo, prioridad, page = 1, limit = 10, search, fecha_desde, fecha_hasta, tipo_entidad } = req.query;
    const where = {};

    // Operadores solo ven sus propios pedidos
    if (req.usuario.rol === 'operador') {
      where.usuario_id = req.usuario.id;
    }

    if (estado) where.estado = estado;
    if (tipo) where.tipo = tipo;
    if (prioridad) where.prioridad = prioridad;
    if (tipo_entidad) where.tipo_entidad = tipo_entidad;

    if (search) {
      where[Op.or] = [
        { codigo: { [Op.like]: `%${search}%` } },
        { titulo: { [Op.like]: `%${search}%` } },
        { descripcion: { [Op.like]: `%${search}%` } },
      ];
    }

    if (fecha_desde || fecha_hasta) {
      where.fecha_requerida = {};
      if (fecha_desde) where.fecha_requerida[Op.gte] = fecha_desde;
      if (fecha_hasta) where.fecha_requerida[Op.lte] = fecha_hasta;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Pedido.findAndCountAll({
      where,
      include: [
        { model: Usuario, as: 'solicitante', attributes: ['id', 'nombre', 'email', 'avatar_url'] },
        { model: Proveedor, as: 'proveedor', attributes: ['id', 'nombre'] },
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      success: true,
      data: rows,
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

const obtener = async (req, res, next) => {
  try {
    const pedido = await Pedido.findByPk(req.params.id, {
      include: [
        { model: Usuario, as: 'solicitante', attributes: ['id', 'nombre', 'email', 'rol', 'avatar_url', 'created_at'] },
        { model: Usuario, as: 'aprobador', attributes: ['id', 'nombre', 'email'] },
        { model: Proveedor, as: 'proveedor' },
        { model: PedidoItem, as: 'items', include: [{ model: Categoria, as: 'categoria' }] },
        {
          model: PedidoHistorial, as: 'historial',
          include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'avatar_url'] }],
          order: [['created_at', 'DESC']],
        },
      ],
    });

    if (!pedido) {
      return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
    }

    // Operadores solo ven sus propios pedidos
    if (req.usuario.rol === 'operador' && pedido.usuario_id !== req.usuario.id) {
      return res.status(403).json({ success: false, message: 'No tienes permisos para ver este pedido' });
    }

    res.json({ success: true, data: pedido });
  } catch (error) {
    next(error);
  }
};

const crear = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { titulo, tipo, descripcion, prioridad, fecha_requerida, proveedor_id, items, impuesto_pct = 0, estado, moneda = 'PEN' } = req.body;

    if (!titulo) {
      return res.status(400).json({ success: false, message: 'El título es requerido' });
    }

    const codigo = await generarCodigo();

    const pedido = await Pedido.create({
      codigo,
      titulo,
      tipo: tipo || 'pedido',
      descripcion,
      tipo_entidad: req.usuario.tipo_entidad,
      estado: estado === 'pendiente' ? 'pendiente' : 'borrador',
      prioridad: prioridad || 'media',
      fecha_requerida,
      moneda: moneda || 'PEN',
      usuario_id: req.usuario.id,
      proveedor_id: proveedor_id || null,
    }, { transaction: t });

    // Create items
    if (items && items.length > 0) {
      const itemsData = items.map((item) => ({
        pedido_id: pedido.id,
        categoria_id: item.categoria_id || null,
        descripcion: item.descripcion,
        cantidad: parseFloat(item.cantidad) || 0,
        unidad: item.unidad || 'unidad',
        precio_unitario: parseFloat(item.precio_unitario) || 0,
        subtotal: (parseFloat(item.cantidad) || 0) * (parseFloat(item.precio_unitario) || 0),
        observaciones: item.observaciones,
      }));
      await PedidoItem.bulkCreate(itemsData, { transaction: t });
    }

    await t.commit();

    // Recalculate totals
    await recalcularTotalesPedido(pedido.id, parseFloat(impuesto_pct) || 0);

    // Create history entry
    await PedidoHistorial.create({
      pedido_id: pedido.id,
      usuario_id: req.usuario.id,
      estado_anterior: null,
      estado_nuevo: pedido.estado,
      comentario: 'Pedido creado',
    });

    // If sent for approval, notify
    if (pedido.estado === 'pendiente') {
      await notificarCambioEstado(pedido, null, 'pendiente', req.usuario);
    }

    const pedidoCompleto = await Pedido.findByPk(pedido.id, {
      include: [
        { model: PedidoItem, as: 'items' },
        { model: Usuario, as: 'solicitante', attributes: ['id', 'nombre', 'email'] },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Pedido creado correctamente',
      data: pedidoCompleto,
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

const actualizar = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const pedido = await Pedido.findByPk(req.params.id);
    if (!pedido) {
      return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
    }

    // Solo borradores pueden editarse (o admin)
    if (pedido.estado !== 'borrador' && req.usuario.rol !== 'admin') {
      return res.status(400).json({ success: false, message: 'Solo se pueden editar pedidos en estado borrador' });
    }

    if (req.usuario.rol === 'operador' && pedido.usuario_id !== req.usuario.id) {
      return res.status(403).json({ success: false, message: 'No tienes permisos para editar este pedido' });
    }

    const { titulo, tipo, descripcion, prioridad, fecha_requerida, proveedor_id, items, impuesto_pct, moneda } = req.body;

    await pedido.update({
      titulo: titulo || pedido.titulo,
      tipo: tipo || pedido.tipo,
      descripcion: descripcion !== undefined ? descripcion : pedido.descripcion,
      prioridad: prioridad || pedido.prioridad,
      fecha_requerida: fecha_requerida !== undefined ? fecha_requerida : pedido.fecha_requerida,
      proveedor_id: proveedor_id !== undefined ? proveedor_id : pedido.proveedor_id,
      moneda: moneda !== undefined ? moneda : pedido.moneda,
    }, { transaction: t });

    // Replace items if provided
    if (items) {
      await PedidoItem.destroy({ where: { pedido_id: pedido.id }, transaction: t });
      if (items.length > 0) {
        const itemsData = items.map((item) => ({
          pedido_id: pedido.id,
          categoria_id: item.categoria_id || null,
          descripcion: item.descripcion,
          cantidad: parseFloat(item.cantidad) || 0,
          unidad: item.unidad || 'unidad',
          precio_unitario: parseFloat(item.precio_unitario) || 0,
          subtotal: (parseFloat(item.cantidad) || 0) * (parseFloat(item.precio_unitario) || 0),
          observaciones: item.observaciones,
        }));
        await PedidoItem.bulkCreate(itemsData, { transaction: t });
      }
    }

    await t.commit();

    if (impuesto_pct !== undefined) {
      await recalcularTotalesPedido(pedido.id, parseFloat(impuesto_pct));
    } else {
      await recalcularTotalesPedido(pedido.id);
    }

    const pedidoActualizado = await Pedido.findByPk(pedido.id, {
      include: [
        { model: PedidoItem, as: 'items', include: [{ model: Categoria, as: 'categoria' }] },
        { model: Usuario, as: 'solicitante', attributes: ['id', 'nombre'] },
        { model: Proveedor, as: 'proveedor' },
      ],
    });

    res.json({ success: true, message: 'Pedido actualizado correctamente', data: pedidoActualizado });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

const cambiarEstado = async (req, res, next) => {
  try {
    const { estado, comentario } = req.body;
    const pedido = await Pedido.findByPk(req.params.id);

    if (!pedido) {
      return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
    }

    const transicionesValidas = {
      borrador: ['pendiente', 'cancelado'],
      pendiente: ['aprobado', 'rechazado', 'cancelado'],
      aprobado: ['en_proceso', 'completado', 'cancelado'],
      rechazado: ['borrador', 'cancelado'],
      en_proceso: ['completado', 'cancelado'],
    };

    const permitidas = transicionesValidas[pedido.estado] || [];
    if (!permitidas.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: `No se puede cambiar de "${pedido.estado}" a "${estado}"`,
      });
    }

    // Permission checks
    const rol = req.usuario.rol;
    if (['aprobado', 'rechazado'].includes(estado) && !['admin', 'aprobador'].includes(rol)) {
      return res.status(403).json({ success: false, message: 'No tienes permisos para aprobar o rechazar pedidos' });
    }

    if (['en_proceso', 'completado'].includes(estado) && !['admin', 'aprobador'].includes(rol)) {
      return res.status(403).json({ success: false, message: 'No tienes permisos para cambiar a este estado' });
    }

    // Reject requires comment
    if (estado === 'rechazado' && !comentario) {
      return res.status(400).json({ success: false, message: 'El motivo de rechazo es obligatorio' });
    }

    const estadoAnterior = pedido.estado;

    const updateData = { estado };
    if (['aprobado', 'rechazado'].includes(estado)) {
      updateData.aprobado_por = req.usuario.id;
      updateData.notas_aprobacion = comentario || null;
    }

    await pedido.update(updateData);

    await PedidoHistorial.create({
      pedido_id: pedido.id,
      usuario_id: req.usuario.id,
      estado_anterior: estadoAnterior,
      estado_nuevo: estado,
      comentario,
    });

    await notificarCambioEstado(pedido, estadoAnterior, estado, req.usuario);

    res.json({ success: true, message: `Pedido ${estado} correctamente`, data: pedido });
  } catch (error) {
    next(error);
  }
};

const eliminar = async (req, res, next) => {
  try {
    const pedido = await Pedido.findByPk(req.params.id);
    if (!pedido) {
      return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
    }

    // Solo borradores propios o admin
    if (req.usuario.rol !== 'admin') {
      if (pedido.estado !== 'borrador' || pedido.usuario_id !== req.usuario.id) {
        return res.status(403).json({ success: false, message: 'Solo puedes eliminar tus propios borradores' });
      }
    }

    await pedido.destroy();
    res.json({ success: true, message: 'Pedido eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};

const obtenerHistorial = async (req, res, next) => {
  try {
    const historial = await PedidoHistorial.findAll({
      where: { pedido_id: req.params.id },
      include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'avatar_url'] }],
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, data: historial });
  } catch (error) {
    next(error);
  }
};

const subirAdjunto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se proporcionó archivo' });
    }

    const pedido = await Pedido.findByPk(req.params.id);
    if (!pedido) {
      return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
    }

    const archivo_adjunto = `/uploads/${req.file.filename}`;
    await pedido.update({ archivo_adjunto });

    res.json({ success: true, message: 'Archivo subido correctamente', data: { archivo_adjunto } });
  } catch (error) {
    next(error);
  }
};

const exportarPDF = async (req, res, next) => {
  try {
    const where = buildWhereFromQuery(req.query, req.usuario);

    const pedidos = await Pedido.findAll({
      where,
      include: [{ model: Usuario, as: 'solicitante', attributes: ['id', 'nombre'] }],
      order: [['created_at', 'DESC']],
    });

    const monto = pedidos.reduce((sum, p) => sum + parseFloat(p.total || 0), 0);

    generarReportePDF(res, {
      pedidos,
      filtros: req.query,
      tipoEntidad: req.usuario.tipo_entidad,
      totales: { cantidad: pedidos.length, monto },
    });
  } catch (error) {
    next(error);
  }
};

const exportarExcel = async (req, res, next) => {
  try {
    const where = buildWhereFromQuery(req.query, req.usuario);

    const pedidos = await Pedido.findAll({
      where,
      include: [{ model: Usuario, as: 'solicitante', attributes: ['id', 'nombre'] }],
      order: [['created_at', 'DESC']],
    });

    const monto = pedidos.reduce((sum, p) => sum + parseFloat(p.total || 0), 0);

    await generarReporteExcel(res, {
      pedidos,
      filtros: req.query,
      tipoEntidad: req.usuario.tipo_entidad,
      totales: { cantidad: pedidos.length, monto },
    });
  } catch (error) {
    next(error);
  }
};

function buildWhereFromQuery(query, usuario) {
  const { estado, tipo, prioridad, search, fecha_desde, fecha_hasta, tipo_entidad } = query;
  const where = {};

  if (usuario.rol === 'operador') {
    where.usuario_id = usuario.id;
  }

  if (estado) where.estado = estado;
  if (tipo) where.tipo = tipo;
  if (prioridad) where.prioridad = prioridad;
  if (tipo_entidad) where.tipo_entidad = tipo_entidad;

  if (search) {
    where[Op.or] = [
      { codigo: { [Op.like]: `%${search}%` } },
      { titulo: { [Op.like]: `%${search}%` } },
    ];
  }

  if (fecha_desde || fecha_hasta) {
    where.fecha_requerida = {};
    if (fecha_desde) where.fecha_requerida[Op.gte] = fecha_desde;
    if (fecha_hasta) where.fecha_requerida[Op.lte] = fecha_hasta;
  }

  return where;
}

module.exports = {
  listar, obtener, crear, actualizar, cambiarEstado, eliminar,
  obtenerHistorial, subirAdjunto, exportarPDF, exportarExcel,
};
