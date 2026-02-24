const router = require('express').Router();
const ctrl = require('../controllers/usuariosController');
const autenticar = require('../middleware/auth');
const verificarRol = require('../middleware/roles');

router.use(autenticar, verificarRol(['admin']));

router.get('/', ctrl.listar);
router.post('/', ctrl.crear);
router.get('/:id', ctrl.obtener);
router.put('/:id', ctrl.actualizar);
router.patch('/:id/toggle-activo', ctrl.toggleActivo);

module.exports = router;
