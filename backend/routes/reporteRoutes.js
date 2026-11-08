const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const reporteController = require('../controllers/reporteController');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../frontend/uploads'));
    },
    filename: (req, file, cb) => {
        const nombreUnico = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, nombreUnico);
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