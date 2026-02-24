const router = require('express').Router();
const { login, register, me, cambiarPassword } = require('../controllers/authController');
const autenticar = require('../middleware/auth');

router.post('/login', login);
router.post('/register', register);
router.get('/me', autenticar, me);
router.put('/cambiar-password', autenticar, cambiarPassword);

module.exports = router;
