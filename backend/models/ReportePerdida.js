const db = require('../config/db');
const ReporteMascota = require('./ReporteMascota');

/* Clase Modelo para la entidad Reporte_Perdida (Tabla Hija) */
class ReportePerdida {
    constructor(id_reporte, fecha_perdida, recompensa) {
        this.id_reporte = id_reporte;
        this.fecha_perdida = fecha_perdida;
        this.recompensa = recompensa;
    }

    /* Registra una mascota perdida insertando en reporte_mascota y reporte_perdida usando transaccion */
    static async registrarPerdida(datos) {
        const conexion = await db.getConnection();
        try {
            await conexion.beginTransaction();

            const idReporteGenerado = await ReporteMascota.crear(datos, conexion);

            const sqlPerdida = `INSERT INTO reporte_perdida (id_reporte, fecha_perdida, recompensa) VALUES (?, ?, ?)`;
            await conexion.execute(sqlPerdida, [
                idReporteGenerado,
                datos.fecha_perdida,
                datos.recompensa || 0.00
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

module.exports = ReportePerdida;