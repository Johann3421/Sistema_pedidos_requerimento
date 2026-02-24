const { verifyToken } = require('../config/jwt');
const { Usuario } = require('../models');

const autenticar = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const usuario = await Usuario.findByPk(decoded.id, {
      attributes: { exclude: ['password_hash'] },
    });

    if (!usuario || !usuario.activo) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado o inactivo',
      });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado, por favor vuelve a iniciar sesión',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Token inválido',
    });
  }
};

module.exports = autenticar;
