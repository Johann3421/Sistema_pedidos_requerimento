const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PedidoItem = sequelize.define('PedidoItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  pedido_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  categoria_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  descripcion: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  cantidad: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  unidad: {
    type: DataTypes.STRING(30),
    defaultValue: 'unidad',
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  subtotal: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'pedido_items',
  timestamps: false,
});

module.exports = PedidoItem;
