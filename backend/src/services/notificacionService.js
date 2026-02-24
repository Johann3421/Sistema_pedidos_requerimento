const { Notificacion, Usuario } = require('../models');

async function crearNotificacion({ usuario_id, pedido_id, tipo, mensaje }) {
  try {
    await Notificacion.create({ usuario_id, pedido_id, tipo, mensaje });
  } catch (error) {
    console.error('Error creando notificación:', error.message);
  }
}

async function notificarCambioEstado(pedido, estadoAnterior, estadoNuevo, usuarioAccion) {
  const mensajes = {
    pendiente: `El pedido ${pedido.codigo} ha sido enviado para aprobación por ${usuarioAccion.nombre}`,
    aprobado: `El pedido ${pedido.codigo} ha sido aprobado por ${usuarioAccion.nombre}`,
    rechazado: `El pedido ${pedido.codigo} ha sido rechazado por ${usuarioAccion.nombre}`,
    en_proceso: `El pedido ${pedido.codigo} ha sido marcado en proceso`,
    completado: `El pedido ${pedido.codigo} ha sido completado`,
    cancelado: `El pedido ${pedido.codigo} ha sido cancelado`,
  };

  const mensaje = mensajes[estadoNuevo] || `El pedido ${pedido.codigo} cambió de estado a ${estadoNuevo}`;

  // Notificar al solicitante si no es el mismo que realizó la acción
  if (pedido.usuario_id !== usuarioAccion.id) {
    await crearNotificacion({
      usuario_id: pedido.usuario_id,
      pedido_id: pedido.id,
      tipo: `estado_${estadoNuevo}`,
      mensaje,
    });
  }

  // Si se envía a aprobación, notificar a admins y aprobadores
  if (estadoNuevo === 'pendiente') {
    const aprobadores = await Usuario.findAll({
      where: { rol: ['admin', 'aprobador'], activo: true },
    });
    for (const aprobador of aprobadores) {
      if (aprobador.id !== usuarioAccion.id) {
        await crearNotificacion({
          usuario_id: aprobador.id,
          pedido_id: pedido.id,
          tipo: 'nueva_aprobacion',
          mensaje: `Nuevo pedido ${pedido.codigo} pendiente de aprobación`,
        });
      }
    }
  }
}

module.exports = { crearNotificacion, notificarCambioEstado };
