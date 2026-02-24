const { Proveedor } = require('../models');

const listar = async (req, res, next) => {
  try {
    const proveedores = await Proveedor.findAll({ order: [['nombre', 'ASC']] });
    res.json({ success: true, data: proveedores });
  } catch (error) {
    next(error);
  }
};

const crear = async (req, res, next) => {
  try {
    const { nombre, ruc_nit, email, telefono, direccion } = req.body;
    if (!nombre) {
      return res.status(400).json({ success: false, message: 'El nombre es requerido' });
    }
    const proveedor = await Proveedor.create({ nombre, ruc_nit, email, telefono, direccion });
    res.status(201).json({ success: true, message: 'Proveedor creado correctamente', data: proveedor });
  } catch (error) {
    next(error);
  }
};

const actualizar = async (req, res, next) => {
  try {
    const proveedor = await Proveedor.findByPk(req.params.id);
    if (!proveedor) {
      return res.status(404).json({ success: false, message: 'Proveedor no encontrado' });
    }
    const { nombre, ruc_nit, email, telefono, direccion } = req.body;
    await proveedor.update({
      nombre: nombre || proveedor.nombre,
      ruc_nit: ruc_nit !== undefined ? ruc_nit : proveedor.ruc_nit,
      email: email !== undefined ? email : proveedor.email,
      telefono: telefono !== undefined ? telefono : proveedor.telefono,
      direccion: direccion !== undefined ? direccion : proveedor.direccion,
    });
    res.json({ success: true, message: 'Proveedor actualizado correctamente', data: proveedor });
  } catch (error) {
    next(error);
  }
};

const toggleActivo = async (req, res, next) => {
  try {
    const proveedor = await Proveedor.findByPk(req.params.id);
    if (!proveedor) {
      return res.status(404).json({ success: false, message: 'Proveedor no encontrado' });
    }
    await proveedor.update({ activo: !proveedor.activo });
    res.json({
      success: true,
      message: `Proveedor ${proveedor.activo ? 'activado' : 'desactivado'}`,
      data: proveedor,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { listar, crear, actualizar, toggleActivo };
