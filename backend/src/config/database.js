require('dotenv').config();
const { Sequelize } = require('sequelize');

// Debug: log DB connection values in development to help diagnose auth errors
if (process.env.NODE_ENV === 'development') {
  const mask = (v) => (v ? '****(set)' : 'EMPTY');
  console.log('\n[DB DEBUG] Using DB config:');
  console.log('[DB DEBUG] DB_NAME=', process.env.DB_NAME || 'sistema_pedidos');
  console.log('[DB DEBUG] DB_USER=', process.env.DB_USER || 'pedidos_user');
  console.log('[DB DEBUG] DB_PASSWORD=', mask(process.env.DB_PASSWORD));
  console.log('[DB DEBUG] DB_HOST=', process.env.DB_HOST || 'localhost');
  console.log('[DB DEBUG] DB_PORT=', process.env.DB_PORT || '3306');
}

const sequelize = new Sequelize(
  process.env.DB_NAME || 'sistema_pedidos',
  process.env.DB_USER || 'pedidos_user',
  // Use nullish coalescing so an explicit empty password from .env is preserved
  (process.env.DB_PASSWORD ?? 'pedidos_pass_2024'),
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    dialectModule: require('mysql2'),
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    timezone: '-05:00',
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

module.exports = sequelize;
