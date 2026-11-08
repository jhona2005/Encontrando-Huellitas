const express = require('express');
const router = express.Router();
const entidadController = require('../controllers/entidadController');

router.post('/', entidadController.registrarEntidad);
router.get('/', entidadController.listarEntidades);

module.exports = router;