const router = require('express').Router();
const ctrl = require('../controllers/pedidosController');
const autenticar = require('../middleware/auth');
const verificarRol = require('../middleware/roles');
const upload = require('../middleware/upload');

router.use(autenticar);

router.get('/exportar/pdf', ctrl.exportarPDF);
router.get('/exportar/excel', ctrl.exportarExcel);

router.get('/', ctrl.listar);
router.post('/', verificarRol(['admin', 'aprobador', 'operador']), ctrl.crear);
router.get('/:id', ctrl.obtener);
router.put('/:id', verificarRol(['admin', 'aprobador', 'operador']), ctrl.actualizar);
router.patch('/:id/estado', ctrl.cambiarEstado);
router.delete('/:id', ctrl.eliminar);
router.get('/:id/historial', ctrl.obtenerHistorial);
router.post('/:id/adjunto', upload.single('archivo'), ctrl.subirAdjunto);

module.exports = router;
