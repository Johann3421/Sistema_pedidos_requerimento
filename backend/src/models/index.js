const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Categoria = require('./Categoria');
const Proveedor = require('./Proveedor');
const Pedido = require('./Pedido');
const PedidoItem = require('./PedidoItem');
const PedidoHistorial = require('./PedidoHistorial');
const Notificacion = require('./Notificacion');

// Pedido -> Usuario (solicitante)
Pedido.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'solicitante' });
Usuario.hasMany(Pedido, { foreignKey: 'usuario_id', as: 'pedidos' });

// Pedido -> Usuario (aprobador)
Pedido.belongsTo(Usuario, { foreignKey: 'aprobado_por', as: 'aprobador' });

// Pedido -> Proveedor
Pedido.belongsTo(Proveedor, { foreignKey: 'proveedor_id', as: 'proveedor' });
Proveedor.hasMany(Pedido, { foreignKey: 'proveedor_id' });

// Pedido -> PedidoItem
Pedido.hasMany(PedidoItem, { foreignKey: 'pedido_id', as: 'items', onDelete: 'CASCADE' });
PedidoItem.belongsTo(Pedido, { foreignKey: 'pedido_id' });

// PedidoItem -> Categoria
PedidoItem.belongsTo(Categoria, { foreignKey: 'categoria_id', as: 'categoria' });
Categoria.hasMany(PedidoItem, { foreignKey: 'categoria_id' });

// Pedido -> PedidoHistorial
Pedido.hasMany(PedidoHistorial, { foreignKey: 'pedido_id', as: 'historial', onDelete: 'CASCADE' });
PedidoHistorial.belongsTo(Pedido, { foreignKey: 'pedido_id' });

// PedidoHistorial -> Usuario
PedidoHistorial.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

// Notificacion -> Usuario
Notificacion.belongsTo(Usuario, { foreignKey: 'usuario_id' });
Usuario.hasMany(Notificacion, { foreignKey: 'usuario_id' });

// Notificacion -> Pedido
Notificacion.belongsTo(Pedido, { foreignKey: 'pedido_id', as: 'pedido' });

module.exports = {
  sequelize,
  Usuario,
  Categoria,
  Proveedor,
  Pedido,
  PedidoItem,
  PedidoHistorial,
  Notificacion,
};
