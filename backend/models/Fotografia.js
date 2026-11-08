const db = require('../config/db');

/* Clase Modelo para la entidad Fotografia */
class Fotografia {
    constructor(id_foto, url_imagen, fecha_carga, id_reporte) {
        this.id_foto = id_foto;
        this.url_imagen = url_imagen;
        this.fecha_carga = fecha_carga;
        this.id_reporte = id_reporte;
    }

    /* Registra una nueva fotografia asociada a un reporte */
    static async cargarImagen(url_imagen, id_reporte) {
        const sql = `INSERT INTO fotografia (url_imagen, id_reporte) VALUES (?, ?)`;
        const [resultado] = await db.execute(sql, [url_imagen, id_reporte]);
        return resultado.insertId;
    }

    /* Obtiene las fotos de un reporte especifico */
    static async obtenerPorReporte(id_reporte) {
        const sql = `SELECT * FROM fotografia WHERE id_reporte = ?`;
        const [filas] = await db.execute(sql, [id_reporte]);
        return filas;
    }

    /* Elimina un registro de fotografia */
    static async eliminarImagen(id_foto) {
        const sql = `DELETE FROM fotografia WHERE id_foto = ?`;
        const [resultado] = await db.execute(sql, [id_foto]);
        return resultado.affectedRows > 0;
    }
}

module.exports = Fotografia;