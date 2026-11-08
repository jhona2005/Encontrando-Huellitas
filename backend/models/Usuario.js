const db = require('../config/db');

/* Clase Modelo para la entidad Usuario */
class Usuario {
    constructor(id_usuario, correo, telefono, contrasena, tipo_usuario, direccion, fecha_reg, estado) {
        this.id_usuario = id_usuario;
        this.correo = correo;
        this.telefono = telefono;
        this.contrasena = contrasena;
        this.tipo_usuario = tipo_usuario;
        this.direccion = direccion;
        this.fecha_reg = fecha_reg;
        this.estado = estado;
    }

    /* Método para registrar un nuevo usuario en la base de datos */
    static async registrar(datosUsuario) {
        const sql = `INSERT INTO usuario (nombre, correo_electronico, telefono, contrasena, tipo_usuario, direccion) 
                     VALUES (?, ?, ?, ?, ?, ?)`;
        const [resultado] = await db.execute(sql, [
            datosUsuario.nombre,
            datosUsuario.correo,
            datosUsuario.telefono,
            datosUsuario.contrasena,
            datosUsuario.tipo_usuario || 'PARTICULAR',
            datosUsuario.direccion
        ]);
        return resultado.insertId;
    }

    /* Método para validar las credenciales de inicio de sesión */
    static async iniciarSesion(correo, contrasena) {
        const sql = `SELECT * FROM usuario WHERE correo_electronico = ? AND contrasena = ? AND estado = 'ACTIVO'`;
        const [filas] = await db.execute(sql, [correo, contrasena]);
        return filas.length > 0 ? filas[0] : null;
    }
}

module.exports = Usuario;