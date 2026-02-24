const router = require('express').Router();
const ctrl = require('../controllers/proveedoresController');
const autenticar = require('../middleware/auth');
const verificarRol = require('../middleware/roles');

router.use(autenticar);

router.get('/', ctrl.listar);
router.post('/', verificarRol(['admin', 'aprobador']), ctrl.crear);
router.put('/:id', verificarRol(['admin', 'aprobador']), ctrl.actualizar);
router.patch('/:id/toggle-activo', verificarRol(['admin', 'aprobador']), ctrl.toggleActivo);

module.exports = router;
