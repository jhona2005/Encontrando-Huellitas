const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const reporteController = require('../controllers/reporteController');
require('dotenv').config();

// Configuración de Cloudinary (lee automáticamente CLOUDINARY_URL del entorno o usa los valores explícitos)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'lxlxfvhu',
    api_key: process.env.CLOUDINARY_API_KEY || '822765192282211',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'zXUmx7BqxYelOMVCOTZhGF5RUbY'
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'encontrando-huellitas',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 800, crop: 'limit' }]
    }
});

const upload = multer({ storage });

router.post('/perdida', upload.single('imagen'), reporteController.crearReportePerdida);
router.post('/hallazgo', upload.single('imagen'), reporteController.crearReporteHallazgo);
router.get('/', reporteController.obtenerReportes);
router.get('/usuario/:id_usuario', reporteController.obtenerReportesPorUsuario);
router.get('/:id', reporteController.obtenerReportePorId);
router.put('/:id/resuelto', reporteController.marcarResuelto);
router.put('/:id_reporte', upload.single('imagen'), reporteController.actualizarReporte);
router.delete('/:id_reporte', reporteController.eliminarReporteFisico);

module.exports = router;