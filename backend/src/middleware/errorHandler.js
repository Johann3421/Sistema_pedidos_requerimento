const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors,
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.errors.map((e) => ({
      field: e.path,
      message: `El valor de ${e.path} ya existe`,
    }));
    return res.status(409).json({
      success: false,
      message: 'Registro duplicado',
      errors,
    });
  }

  if (err.name === 'MulterError') {
    let message = 'Error al subir archivo';
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'El archivo excede el tamaño máximo permitido (10MB)';
    }
    return res.status(400).json({
      success: false,
      message,
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Error interno del servidor',
  });
};

module.exports = errorHandler;
