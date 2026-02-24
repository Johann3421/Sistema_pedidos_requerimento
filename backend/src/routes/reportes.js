const router = require('express').Router();
const ctrl = require('../controllers/reportesController');
const autenticar = require('../middleware/auth');

router.use(autenticar);

router.get('/', ctrl.listar);
router.get('/estadisticas', ctrl.estadisticas);
router.get('/exportar/pdf', ctrl.exportarPDF);
router.get('/exportar/excel', ctrl.exportarExcel);

module.exports = router;
