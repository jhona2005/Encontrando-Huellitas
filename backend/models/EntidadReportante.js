const db = require('../config/db');

/* Clase Modelo para la entidad Entidad_Reportante */
class EntidadReportante {
    constructor(id_entidad, nombre_entidad, tipo_entidad, direccion, telefono, correo_contacto, estado_validacion) {
        this.id_entidad = id_entidad;
        this.nombre_entidad = nombre_entidad;
        this.tipo_entidad = tipo_entidad;
        this.direccion = direccion;
        this.telefono = telefono;
        this.correo_contacto = correo_contacto;
        this.estado_validacion = estado_validacion;
    }

    /* Registra una nueva entidad en la base de datos */
    static async registrar(datos) {
        const sql = `INSERT INTO entidad_reportante (nombre_entidad, tipo_entidad, direccion, telefono, correo_contacto) 
                     VALUES (?, ?, ?, ?, ?)`;
        const [resultado] = await db.execute(sql, [
            datos.nombre_entidad,
            datos.tipo_entidad,
            datos.direccion,
            datos.telefono,
            datos.correo_contacto
        ]);
        return resultado.insertId;
    }

    /* Lista las entidades registradas */
    static async listarTodas() {
        const sql = `SELECT * FROM entidad_reportante ORDER BY nombre_entidad ASC`;
        const [filas] = await db.execute(sql);
        return filas;
    }
}

module.exports = EntidadReportante;