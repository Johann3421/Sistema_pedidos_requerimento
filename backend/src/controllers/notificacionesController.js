const { Notificacion, Pedido } = require('../models');

const listar = async (req, res, next) => {
  try {
    const notificaciones = await Notificacion.findAll({
      where: { usuario_id: req.usuario.id },
      include: [{ model: Pedido, as: 'pedido', attributes: ['id', 'codigo', 'titulo'] }],
      order: [['created_at', 'DESC']],
      limit: 50,
    });
    const noLeidas = notificaciones.filter((n) => !n.leida).length;
    res.json({ success: true, data: notificaciones, noLeidas });
  } catch (error) {
    next(error);
  }
};

const marcarLeida = async (req, res, next) => {
  try {
    const notif = await Notificacion.findByPk(req.params.id);
    if (!notif || notif.usuario_id !== req.usuario.id) {
      return res.status(404).json({ success: false, message: 'Notificación no encontrada' });
    }
    await notif.update({ leida: true });
    res.json({ success: true, message: 'Notificación marcada como leída' });
  } catch (error) {
    next(error);
  }
};

const marcarTodasLeidas = async (req, res, next) => {
  try {
    await Notificacion.update(
      { leida: true },
      { where: { usuario_id: req.usuario.id, leida: false } }
    );
    res.json({ success: true, message: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    next(error);
  }
};

module.exports = { listar, marcarLeida, marcarTodasLeidas };
