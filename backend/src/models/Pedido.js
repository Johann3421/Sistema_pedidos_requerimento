const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pedido = sequelize.define('Pedido', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  codigo: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  titulo: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  tipo: {
    type: DataTypes.ENUM('pedido', 'requerimiento'),
    defaultValue: 'pedido',
  },
  tipo_entidad: {
    type: DataTypes.ENUM('entidad', 'tienda'),
    allowNull: false,
  },
  estado: {
    type: DataTypes.ENUM('borrador', 'pendiente', 'aprobado', 'rechazado', 'en_proceso', 'completado', 'cancelado'),
    defaultValue: 'borrador',
  },
  prioridad: {
    type: DataTypes.ENUM('baja', 'media', 'alta', 'urgente'),
    defaultValue: 'media',
  },
  moneda: {
    type: DataTypes.ENUM('PEN', 'USD'),
    defaultValue: 'PEN',
  },
  fecha_requerida: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  aprobado_por: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  proveedor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  subtotal: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  impuesto: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  total: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  notas_aprobacion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  archivo_adjunto: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
}, {
  tableName: 'pedidos',
});

module.exports = Pedido;
