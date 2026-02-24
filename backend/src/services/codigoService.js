const { Pedido } = require('../models');
const sequelize = require('../config/database');

async function generarCodigo() {
  const t = await sequelize.transaction();
  try {
    const year = new Date().getFullYear();
    const prefix = `PED-${year}-`;

    const ultimo = await Pedido.findOne({
      where: sequelize.where(
        sequelize.fn('LEFT', sequelize.col('codigo'), prefix.length),
        prefix
      ),
      order: [['id', 'DESC']],
      lock: t.LOCK.UPDATE,
      transaction: t,
    });

    let siguiente = 1;
    if (ultimo && ultimo.codigo) {
      const numStr = ultimo.codigo.substring(prefix.length);
      siguiente = parseInt(numStr, 10) + 1;
    }

    const codigo = `${prefix}${String(siguiente).padStart(5, '0')}`;
    await t.commit();
    return codigo;
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

module.exports = { generarCodigo };
