const db = require('../config/db');

/* Clase Modelo para la entidad Reporte_Mascota */
class ReporteMascota {
    constructor(id_reporte, especie, raza, color_principal, color_secundario, tamano, descripcion, zona, fecha_reporte, estado, id_usuario) {
        this.id_reporte = id_reporte;
        this.especie = especie;
        this.raza = raza;
        this.color_principal = color_principal;
        this.color_secundario = color_secundario;
        this.tamano = tamano;
        this.descripcion = descripcion;
        this.zona = zona;
        this.fecha_reporte = fecha_reporte;
        this.estado = estado;
        this.id_usuario = id_usuario;
    }

    /* Crea un registro base en la tabla reporte_mascota */
    static async crear(datosReporte, conexion = db) {
        const sql = `INSERT INTO reporte_mascota 
                    (especie, raza, color_principal, color_secundario, tamano, descripcion, zona, id_usuario) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const [resultado] = await conexion.execute(sql, [
            datosReporte.especie,
            datosReporte.raza,
            datosReporte.color_principal,
            datosReporte.color_secundario || 'NO_APLICA',
            datosReporte.tamano,
            datosReporte.descripcion,
            datosReporte.zona,
            datosReporte.id_usuario
        ]);
        return resultado.insertId;
    }

    /* Cambia el estado de un reporte a ENCONTRADO */
    static async marcarResuelto(id_reporte) {
        const sql = `UPDATE reporte_mascota SET estado = 'ENCONTRADO' WHERE id_reporte = ?`;
        const [resultado] = await db.execute(sql, [id_reporte]);
        return resultado.affectedRows > 0;
    }

    /* Consulta general de reportes con filtros por atributos y estados PERDIDO / ENCONTRADO */
    static async buscar(filtros = {}) {
        let sql = `SELECT rm.*, rp.fecha_perdida, rp.recompensa, rh.fecha_hallazgo, rh.id_entidad,
                          (SELECT url_imagen FROM fotografia f WHERE f.id_reporte = rm.id_reporte LIMIT 1) AS url_imagen
                   FROM reporte_mascota rm
                   LEFT JOIN reporte_perdida rp ON rm.id_reporte = rp.id_reporte
                   LEFT JOIN reporte_hallazgo rh ON rm.id_reporte = rh.id_reporte
                   WHERE rm.estado IN ('PERDIDO', 'ENCONTRADO', 'RESUELTO')`;
        
        const parametros = [];

        if (filtros.especie) {
            sql += ` AND rm.especie = ?`;
            parametros.push(filtros.especie);
        }
        if (filtros.raza) {
            sql += ` AND rm.raza LIKE ?`;
            parametros.push(`%${filtros.raza}%`);
        }
        if (filtros.color_principal) {
            sql += ` AND rm.color_principal = ?`;
            parametros.push(filtros.color_principal);
        }
        if (filtros.zona) {
            sql += ` AND rm.zona = ?`;
            parametros.push(filtros.zona);
        }

        sql += ` ORDER BY rm.fecha_reporte DESC`;
        const [filas] = await db.execute(sql, parametros);
        return filas;
    }
}

module.exports = ReporteMascota;