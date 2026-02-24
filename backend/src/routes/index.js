const router = require('express').Router();

router.use('/auth', require('./auth'));
router.use('/pedidos', require('./pedidos'));
router.use('/usuarios', require('./usuarios'));
router.use('/proveedores', require('./proveedores'));
router.use('/categorias', require('./categorias'));
router.use('/reportes', require('./reportes'));
router.use('/notificaciones', require('./notificaciones'));

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

module.exports = router;
