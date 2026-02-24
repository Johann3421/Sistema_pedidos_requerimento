const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PedidoHistorial = sequelize.define('PedidoHistorial', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  pedido_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  estado_anterior: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  estado_nuevo: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  comentario: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'pedido_historial',
  updatedAt: false,
});

module.exports = PedidoHistorial;
