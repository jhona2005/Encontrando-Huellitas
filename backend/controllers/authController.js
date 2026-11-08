const Usuario = require('../models/Usuario');
const db = require('../config/db');

/* Controladores para registro e inicio de sesion de usuarios */
exports.registrarUsuario = async (req, res) => {
    try {
        const idGenerado = await Usuario.registrar(req.body);
        res.status(201).json({ mensaje: 'Usuario registrado exitosamente', id_usuario: idGenerado });
    } catch (error) {
        console.error('Error detallado en registro:', error);
        res.status(500).json({ error: 'Error al registrar el usuario en la base de datos', detalle: error.message });
    }
};

exports.loginUsuario = async (req, res) => {
    try {
        const { correo, contrasena } = req.body;
        const usuario = await Usuario.iniciarSesion(correo, contrasena);
        if (!usuario) {
            return res.status(401).json({ error: 'Credenciales invalidas' });
        }
        res.json({ mensaje: 'Inicio de sesion exitoso', usuario });
    } catch (error) {
        console.error('Error detallado en login:', error);
        res.status(500).json({ error: 'Error al iniciar sesion', detalle: error.message });
    }
};

/* Confirmacion explicita de contraseña para acciones privilegiadas (ADMIN) */
exports.validarPassword = async (req, res) => {
    try {
        const { id_usuario, contrasena } = req.body;
        const [rows] = await db.execute(
            `SELECT * FROM usuario WHERE id_usuario = ? AND contrasena = ? AND estado = 'ACTIVO'`,
            [id_usuario, contrasena]
        );

        if (rows.length === 0) {
            return res.status(401).json({ valido: false, mensaje: 'Contraseña incorrecta o usuario no autorizado' });
        }

        return res.json({ valido: true, mensaje: 'Verificación exitosa' });
    } catch (error) {
        console.error('Error al validar contraseña:', error);
        return res.status(500).json({ error: 'Error interno en la verificación' });
    }
};