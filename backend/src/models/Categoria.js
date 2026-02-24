const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Categoria = sequelize.define('Categoria', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  icono: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  color: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: '#3b82f6',
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'categorias',
  timestamps: false,
});

module.exports = Categoria;
