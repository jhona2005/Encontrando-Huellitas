const EntidadReportante = require('../models/EntidadReportante');

/* Controlador para registrar una nueva entidad reportante */
exports.registrarEntidad = async (req, res) => {
    try {
        const idGenerado = await EntidadReportante.registrar(req.body);
        res.status(201).json({ mensaje: 'Entidad registrada exitosamente', id_entidad: idGenerado });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar la entidad', detalle: error.message });
    }
};

/* Controlador para listar las entidades registradas */
exports.listarEntidades = async (req, res) => {
    try {
        const entidades = await EntidadReportante.listarTodas();
        res.json(entidades);
    } catch (error) {
        res.status(500).json({ error: 'Error al listar entidades', detalle: error.message });
    }
};