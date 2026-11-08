const express = require('express');
const router = express.Router();
const mensajeController = require('../controllers/mensajeController');

router.post('/', mensajeController.enviarMensaje);
router.get('/', mensajeController.obtenerMensajes);
router.get('/chats', mensajeController.obtenerChatsUsuario);

module.exports = router;