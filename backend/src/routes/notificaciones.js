const router = require('express').Router();
const ctrl = require('../controllers/notificacionesController');
const autenticar = require('../middleware/auth');

router.use(autenticar);

router.get('/', ctrl.listar);
router.patch('/:id/leer', ctrl.marcarLeida);
router.patch('/leer-todas', ctrl.marcarTodasLeidas);

module.exports = router;
