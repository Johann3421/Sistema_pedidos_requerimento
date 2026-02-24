const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  rol: {
    type: DataTypes.ENUM('admin', 'operador', 'aprobador', 'visualizador'),
    defaultValue: 'operador',
  },
  tipo_entidad: {
    type: DataTypes.ENUM('entidad', 'tienda'),
    allowNull: false,
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  avatar_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
}, {
  tableName: 'usuarios',
});

module.exports = Usuario;
