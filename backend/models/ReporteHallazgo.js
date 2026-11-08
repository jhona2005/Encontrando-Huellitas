const db = require('../config/db');
const ReporteMascota = require('./ReporteMascota');

/* Clase Modelo para la entidad Reporte_Hallazgo (Tabla Hija) */
class ReporteHallazgo {
    constructor(id_reporte, fecha_hallazgo, id_entidad) {
        this.id_reporte = id_reporte;
        this.fecha_hallazgo = fecha_hallazgo;
        this.id_entidad = id_entidad;
    }

    /* Registra una mascota encontrada insertando en reporte_mascota y reporte_hallazgo usando transaccion */
    static async registrarHallazgo(datos) {
        const conexion = await db.getConnection();
        try {
            await conexion.beginTransaction();

            const idReporteGenerado = await ReporteMascota.crear(datos, conexion);

            const sqlHallazgo = `INSERT INTO reporte_hallazgo (id_reporte, fecha_hallazgo, id_entidad) VALUES (?, ?, ?)`;
            await conexion.execute(sqlHallazgo, [
                idReporteGenerado,
                datos.fecha_hallazgo,
                datos.id_entidad || null
            ]);

            if (datos.url_imagen) {
                const sqlFoto = `INSERT INTO fotografia (url_imagen, id_reporte) VALUES (?, ?)`;
                await conexion.execute(sqlFoto, [datos.url_imagen, idReporteGenerado]);
            }

            await conexion.commit();
            return idReporteGenerado;
        } catch (error) {
            await conexion.rollback();
            throw error;
        } finally {
            conexion.release();
        }
    }
}

module.exports = ReporteHallazgo;