const db = require('../config/db');

/* Obtener unicamente las coincidencias activas asociadas al usuario autenticado */
exports.obtenerCoincidencias = async (req, res) => {
    try {
        const idUsuario = req.query.id_usuario;

        if (!idUsuario) {
            return res.status(400).json({ error: 'Se requiere id_usuario para consultar sus coincidencias' });
        }

        const sql = `
            SELECT 
                c.id_coincidencia,
                c.porcentaje_similitud,
                c.fecha_generacion,
                rm_p.id_reporte AS id_perdida,
                rm_p.especie,
                rm_p.raza AS raza_perdida,
                rm_p.color_principal AS color_perdido,
                rm_p.color_secundario AS color_secundario_perdido,
                rm_p.zona AS zona_perdida,
                rm_p.id_usuario AS id_usuario_perdida,
                u_p.nombre AS nombre_perdida,
                rm_h.id_reporte AS id_hallazgo,
                rm_h.raza AS raza_hallada,
                rm_h.color_principal AS color_hallado,
                rm_h.color_secundario AS color_secundario_hallado,
                rm_h.zona AS zona_hallada,
                rm_h.id_usuario AS id_usuario_hallazgo,
                u_h.nombre AS nombre_hallazgo,
                (SELECT url_imagen FROM fotografia WHERE id_reporte = rm_p.id_reporte LIMIT 1) AS foto_perdida,
                (SELECT url_imagen FROM fotografia WHERE id_reporte = rm_h.id_reporte LIMIT 1) AS foto_hallada
            FROM coincidencia c
            INNER JOIN reporte_mascota rm_p ON c.id_reporte_perdida = rm_p.id_reporte
            INNER JOIN usuario u_p ON rm_p.id_usuario = u_p.id_usuario
            INNER JOIN reporte_mascota rm_h ON c.id_reporte_hallazgo = rm_h.id_reporte
            INNER JOIN usuario u_h ON rm_h.id_usuario = u_h.id_usuario
            WHERE (rm_p.id_usuario = ? OR rm_h.id_usuario = ?)
              AND rm_p.estado = 'PERDIDO'
              AND rm_h.estado NOT IN ('ENCONTRADO', 'RESUELTO')
            ORDER BY c.porcentaje_similitud DESC`;

        const [filas] = await db.execute(sql, [idUsuario, idUsuario]);
        res.json(filas);
    } catch (error) {
        console.error('Error al consultar coincidencias:', error);
        res.status(500).json({ error: 'Error al consultar coincidencias', detalle: error.message });
    }
};