const express = require('express');
const router = express.Router();
const coincidenciaController = require('../controllers/coincidenciaController');

router.get('/', coincidenciaController.obtenerCoincidencias);

module.exports = router;