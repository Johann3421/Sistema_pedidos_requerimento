const bcrypt = require('bcryptjs');
const { Usuario } = require('../models');

const listar = async (req, res, next) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ['password_hash'] },
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, data: usuarios });
  } catch (error) {
    next(error);
  }
};

const obtener = async (req, res, next) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash'] },
    });
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    res.json({ success: true, data: usuario });
  } catch (error) {
    next(error);
  }
};

const crear = async (req, res, next) => {
  try {
    const { nombre, email, password, rol, tipo_entidad } = req.body;

    if (!nombre || !email || !password || !tipo_entidad) {
      return res.status(400).json({ success: false, message: 'Campos obligatorios faltantes' });
    }

    const existe = await Usuario.findOne({ where: { email } });
    if (existe) {
      return res.status(409).json({ success: false, message: 'Ya existe un usuario con ese email' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const usuario = await Usuario.create({
      nombre, email, password_hash, rol: rol || 'operador', tipo_entidad,
    });

    const data = usuario.toJSON();
    delete data.password_hash;

    res.status(201).json({ success: true, message: 'Usuario creado correctamente', data });
  } catch (error) {
    next(error);
  }
};

const actualizar = async (req, res, next) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const { nombre, email, password, rol, tipo_entidad, avatar_url } = req.body;

    if (email && email !== usuario.email) {
      const existe = await Usuario.findOne({ where: { email } });
      if (existe) {
        return res.status(409).json({ success: false, message: 'Ya existe un usuario con ese email' });
      }
    }

    const updateData = {};
    if (nombre) updateData.nombre = nombre;
    if (email) updateData.email = email;
    if (rol) updateData.rol = rol;
    if (tipo_entidad) updateData.tipo_entidad = tipo_entidad;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 12);
    }

    await usuario.update(updateData);

    const data = usuario.toJSON();
    delete data.password_hash;

    res.json({ success: true, message: 'Usuario actualizado correctamente', data });
  } catch (error) {
    next(error);
  }
};

const toggleActivo = async (req, res, next) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // No se puede desactivar el propio admin logueado
    if (usuario.id === req.usuario.id) {
      return res.status(400).json({ success: false, message: 'No puedes desactivar tu propia cuenta' });
    }

    await usuario.update({ activo: !usuario.activo });

    res.json({
      success: true,
      message: `Usuario ${usuario.activo ? 'activado' : 'desactivado'} correctamente`,
      data: { id: usuario.id, activo: usuario.activo },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { listar, obtener, crear, actualizar, toggleActivo };
