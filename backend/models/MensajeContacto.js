const db = require('../config/db');

class MensajeContacto {
    constructor(id_mensaje, contenido_mensaje, fecha_envio, id_usuario_emisor, id_usuario_receptor, id_coincidencia, id_reporte) {
        this.id_mensaje = id_mensaje;
        this.contenido_mensaje = contenido_mensaje;
        this.fecha_envio = fecha_envio;
        this.id_usuario_emisor = id_usuario_emisor;
        this.id_usuario_receptor = id_usuario_receptor;
        this.id_coincidencia = id_coincidencia;
        this.id_reporte = id_reporte;
    }

    static async enviar(datos) {
        const sql = `INSERT INTO mensaje_contacto 
                    (contenido_mensaje, id_usuario_emisor, id_usuario_receptor, id_coincidencia, id_reporte) 
                    VALUES (?, ?, ?, ?, ?)`;
        
        const valorCoincidencia = datos.id_coincidencia && datos.id_coincidencia !== 'undefined' ? datos.id_coincidencia : null;
        const valorReporte = datos.id_reporte && datos.id_reporte !== 'undefined' ? datos.id_reporte : null;
        const valorReceptor = datos.id_usuario_receptor && datos.id_usuario_receptor !== 'undefined' ? datos.id_usuario_receptor : null;

        const [resultado] = await db.execute(sql, [
            datos.contenido_mensaje,
            datos.id_usuario_emisor,
            valorReceptor,
            valorCoincidencia,
            valorReporte
        ]);
        return resultado.insertId;
    }

    static async obtenerPorReporteOCoincidencia(id_reporte, id_coincidencia) {
        let sql = `SELECT m.*, u_e.nombre AS emisor_nombre
                   FROM mensaje_contacto m
                   INNER JOIN usuario u_e ON m.id_usuario_emisor = u_e.id_usuario
                   WHERE 1=1`;
        const parametros = [];

        if (id_coincidencia && id_coincidencia !== 'undefined') {
            sql += ` AND m.id_coincidencia = ?`;
            parametros.push(id_coincidencia);
        } else if (id_reporte && id_reporte !== 'undefined') {
            sql += ` AND m.id_reporte = ?`;
            parametros.push(id_reporte);
        }

        sql += ` ORDER BY m.fecha_envio ASC`;
        const [filas] = await db.execute(sql, parametros);
        return filas;
    }
}

module.exports = MensajeContacto;