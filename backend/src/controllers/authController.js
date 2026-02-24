const bcrypt = require('bcryptjs');
const { signToken } = require('../config/jwt');
const { Usuario } = require('../models');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log('[AUTH DEBUG] login payload:', { email, password: password ? '***' : password });

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos',
      });
    }

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos',
      });
    }

    if (!usuario.activo) {
      return res.status(401).json({
        success: false,
        message: 'Tu cuenta está desactivada. Contacta al administrador.',
      });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValido) {
      return res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos',
      });
    }

    const token = signToken({ id: usuario.id, email: usuario.email, rol: usuario.rol });

    const userData = usuario.toJSON();
    delete userData.password_hash;

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: { token, usuario: userData },
    });
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const { nombre, email, password, tipo_entidad, rol } = req.body;

    if (!nombre || !email || !password || !tipo_entidad) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos obligatorios son requeridos',
      });
    }

    const existe = await Usuario.findOne({ where: { email } });
    if (existe) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un usuario con ese email',
      });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const usuario = await Usuario.create({
      nombre,
      email,
      password_hash,
      tipo_entidad,
      rol: rol || 'operador',
    });

    const token = signToken({ id: usuario.id, email: usuario.email, rol: usuario.rol });

    const userData = usuario.toJSON();
    delete userData.password_hash;

    res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente',
      data: { token, usuario: userData },
    });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res) => {
  res.json({
    success: true,
    data: req.usuario,
  });
};

const cambiarPassword = async (req, res, next) => {
  try {
    const { password_actual, password_nueva } = req.body;

    if (!password_actual || !password_nueva) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña actual y nueva son requeridas',
      });
    }

    if (password_nueva.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres',
      });
    }

    const usuario = await Usuario.findByPk(req.usuario.id);
    const passwordValido = await bcrypt.compare(password_actual, usuario.password_hash);
    if (!passwordValido) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña actual es incorrecta',
      });
    }

    usuario.password_hash = await bcrypt.hash(password_nueva, 12);
    await usuario.save();

    res.json({
      success: true,
      message: 'Contraseña actualizada correctamente',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, register, me, cambiarPassword };
