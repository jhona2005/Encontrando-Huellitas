const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/registro', authController.registrarUsuario);
router.post('/login', authController.loginUsuario);
router.post('/validar-password', authController.validarPassword);

module.exports = router;