const db = require('../config/db');
const MensajeContacto = require('../models/MensajeContacto');

exports.enviarMensaje = async (req, res) => {
    try {
        const { contenido_mensaje, mensaje, id_usuario_emisor, id_usuario_receptor, id_coincidencia, id_reporte } = req.body;

        const textoFinal = contenido_mensaje || mensaje;

        if (!textoFinal || !id_usuario_emisor) {
            return res.status(400).json({ error: 'Faltan datos obligatorios para registrar el mensaje.' });
        }

        const idGenerado = await MensajeContacto.enviar({
            contenido_mensaje: textoFinal,
            id_usuario_emisor,
            id_usuario_receptor,
            id_coincidencia,
            id_reporte
        });

        res.status(201).json({ mensaje: 'Mensaje enviado exitosamente', id_mensaje: idGenerado });
    } catch (error) {
        console.error('Error detallado en mensajeController:', error);
        res.status(500).json({ 
            error: 'Error al registrar el mensaje en la base de datos', 
            detalle: error.message || error.sqlMessage 
        });
    }
};

exports.obtenerMensajes = async (req, res) => {
    try {
        const { id_reporte, id_coincidencia, id_emisor, id_receptor } = req.query;

        if (id_coincidencia && id_coincidencia !== 'undefined' && id_coincidencia !== 'null') {
            const mensajes = await MensajeContacto.obtenerPorReporteOCoincidencia(null, id_coincidencia);
            return res.json(mensajes);
        }

        if (id_emisor && id_receptor) {
            let sql = `
                SELECT m.*, u_e.nombre AS emisor_nombre
                FROM mensaje_contacto m
                INNER JOIN usuario u_e ON m.id_usuario_emisor = u_e.id_usuario
                WHERE ((m.id_usuario_emisor = ? AND m.id_usuario_receptor = ?) 
                    OR (m.id_usuario_emisor = ? AND m.id_usuario_receptor = ?))
            `;
            const params = [id_emisor, id_receptor, id_receptor, id_emisor];

            if (id_reporte && id_reporte !== 'undefined' && id_reporte !== 'null') {
                sql += ` AND m.id_reporte = ?`;
                params.push(id_reporte);
            }

            sql += ` ORDER BY m.fecha_envio ASC`;
            const [filas] = await db.execute(sql, params);
            return res.json(filas);
        }

        return res.json([]);
    } catch (error) {
        console.error('Error al obtener mensajes:', error);
        res.status(500).json({ error: 'Error al obtener mensajes', detalle: error.message });
    }
};

/* Obtener conversaciones unificadas agrupadas por el usuario con el que se chatea */
exports.obtenerChatsUsuario = async (req, res) => {
    try {
        const { id_usuario } = req.query;
        if (!id_usuario) {
            return res.status(400).json({ error: 'id_usuario requerido' });
        }

        const sql = `
            SELECT 
                sub.id_otro,
                u.nombre AS nombre_otro,
                sub.id_reporte,
                sub.id_coincidencia,
                sub.ultima_fecha,
                rm.raza,
                c.porcentaje_similitud
            FROM (
                SELECT 
                    IF(id_usuario_emisor = ?, id_usuario_receptor, id_usuario_emisor) AS id_otro,
                    MAX(id_reporte) AS id_reporte,
                    MAX(id_coincidencia) AS id_coincidencia,
                    MAX(fecha_envio) AS ultima_fecha
                FROM mensaje_contacto
                WHERE id_usuario_emisor = ? OR id_usuario_receptor = ?
                GROUP BY id_otro
            ) sub
            INNER JOIN usuario u ON sub.id_otro = u.id_usuario
            LEFT JOIN reporte_mascota rm ON sub.id_reporte = rm.id_reporte
            LEFT JOIN coincidencia c ON sub.id_coincidencia = c.id_coincidencia
            ORDER BY sub.ultima_fecha DESC
        `;

        const [filas] = await db.execute(sql, [id_usuario, id_usuario, id_usuario]);
        res.json(filas);
    } catch (error) {
        console.error('Error al obtener chats del usuario:', error);
        res.status(500).json({ error: 'Error al obtener conversaciones', detalle: error.message });
    }
};