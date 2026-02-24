const { Categoria } = require('../models');

const listar = async (req, res, next) => {
  try {
    const categorias = await Categoria.findAll({ order: [['nombre', 'ASC']] });
    res.json({ success: true, data: categorias });
  } catch (error) {
    next(error);
  }
};

const crear = async (req, res, next) => {
  try {
    const { nombre, descripcion, icono, color } = req.body;
    if (!nombre) {
      return res.status(400).json({ success: false, message: 'El nombre es requerido' });
    }
    const categoria = await Categoria.create({ nombre, descripcion, icono, color });
    res.status(201).json({ success: true, message: 'Categoría creada correctamente', data: categoria });
  } catch (error) {
    next(error);
  }
};

const actualizar = async (req, res, next) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id);
    if (!categoria) {
      return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    }
    const { nombre, descripcion, icono, color, activo } = req.body;
    await categoria.update({
      nombre: nombre || categoria.nombre,
      descripcion: descripcion !== undefined ? descripcion : categoria.descripcion,
      icono: icono !== undefined ? icono : categoria.icono,
      color: color !== undefined ? color : categoria.color,
      activo: activo !== undefined ? activo : categoria.activo,
    });
    res.json({ success: true, message: 'Categoría actualizada correctamente', data: categoria });
  } catch (error) {
    next(error);
  }
};

const toggleActivo = async (req, res, next) => {
  try {
    const categoria = await Categoria.findByPk(req.params.id);
    if (!categoria) {
      return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    }
    await categoria.update({ activo: !categoria.activo });
    res.json({
      success: true,
      message: `Categoría ${categoria.activo ? 'activada' : 'desactivada'}`,
      data: categoria,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { listar, crear, actualizar, toggleActivo };
