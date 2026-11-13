const db = require('../config/db');
const Coincidencia = require('../models/Coincidencia');

// Obtener reportes activos para la pantalla principal (Excluye CERRADOS)
exports.obtenerReportes = async (req, res) => {
    try {
        const { especie, raza, color_principal, zona } = req.query;

        let sql = `
            SELECT rm.*, f.url_imagen 
            FROM reporte_mascota rm
            LEFT JOIN fotografia f ON rm.id_reporte = f.id_reporte
            WHERE rm.estado != 'CERRADO'
        `;
        const parametros = [];

        if (especie && especie.trim() !== '' && especie !== 'Todas') {
            sql += ` AND rm.especie = ?`;
            parametros.push(especie.trim());
        }

        if (raza && raza.trim() !== '' && raza !== 'Todas las razas') {
            const razaLimpia = raza.trim().replace(/[áàäâ]/g, 'a').replace(/[éèëê]/g, 'e').replace(/[íìïî]/g, 'i').replace(/[óòöô]/g, 'o').replace(/[úùüû]/g, 'u');
            sql += ` AND REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(rm.raza, 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u') LIKE ?`;
            parametros.push(`%${razaLimpia}%`);
        }

        if (color_principal && color_principal.trim() !== '' && color_principal !== 'Todos los colores') {
            const colorLimpio = color_principal.split('/')[0].trim().replace(/[áàäâ]/g, 'a').replace(/[éèëê]/g, 'e').replace(/[íìïî]/g, 'i').replace(/[óòöô]/g, 'o').replace(/[úùüû]/g, 'u');
            sql += ` AND (
                REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(rm.color_principal, 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u') LIKE ?
                OR REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(rm.color_secundario, 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u') LIKE ?
            )`;
            parametros.push(`%${colorLimpio}%`, `%${colorLimpio}%`);
        }

        if (zona && zona.trim() !== '' && zona !== 'Todas las localidades') {
            const zonaLimpia = zona.trim().replace(/[áàäâ]/g, 'a').replace(/[éèëê]/g, 'e').replace(/[íìïî]/g, 'i').replace(/[óòöô]/g, 'o').replace(/[úùüû]/g, 'u');
            sql += ` AND REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(rm.zona, 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u') LIKE ?`;
            parametros.push(`%${zonaLimpia}%`);
        }

        sql += ` ORDER BY rm.fecha_reporte DESC`;

        const [rows] = await db.execute(sql, parametros);
        return res.json(rows);
    } catch (error) {
        console.error('Error al obtener reportes:', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};

// Obtener reportes especificos del usuario (Incluye CERRADOS para mostrar la leyenda en su perfil)
exports.obtenerReportesPorUsuario = async (req, res) => {
    try {
        const { id_usuario } = req.params;
        const [rows] = await db.execute(`
            SELECT rm.*, f.url_imagen 
            FROM reporte_mascota rm
            LEFT JOIN fotografia f ON rm.id_reporte = f.id_reporte
            WHERE rm.id_usuario = ?
            ORDER BY rm.fecha_reporte DESC
        `, [id_usuario]);

        return res.json(rows);
    } catch (error) {
        console.error('Error al obtener reportes del usuario:', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};

// Obtener un reporte especifico por ID
exports.obtenerReportePorId = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.execute(`
            SELECT rm.*, f.url_imagen, rp.fecha_perdida, rp.recompensa, rh.fecha_hallazgo
            FROM reporte_mascota rm
            LEFT JOIN fotografia f ON rm.id_reporte = f.id_reporte
            LEFT JOIN reporte_perdida rp ON rm.id_reporte = rp.id_reporte
            LEFT JOIN reporte_hallazgo rh ON rm.id_reporte = rh.id_reporte
            WHERE rm.id_reporte = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Reporte no encontrado' });
        }
        return res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener reporte por id:', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};

// Crear nuevo reporte de perdida
exports.crearReportePerdida = async (req, res) => {
    try {
        const { especie, raza, color_principal, color_secundario, tamano, descripcion, zona, fecha_perdida, fecha_evento, recompensa, id_usuario } = req.body;
        const url_imagen = req.file ? req.file.path : '/uploads/default.jpg';
        const fechaFinal = fecha_perdida || fecha_evento || new Date();

        const [resMascota] = await db.execute(`
            INSERT INTO reporte_mascota (especie, raza, color_principal, color_secundario, tamano, descripcion, zona, estado, id_usuario)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'PERDIDO', ?)
        `, [especie, raza, color_principal, color_secundario || 'NO_APLICA', tamano, descripcion, zona, id_usuario]);

        const id_reporte = resMascota.insertId;

        await db.execute(`INSERT INTO reporte_perdida (id_reporte, fecha_perdida, recompensa) VALUES (?, ?, ?)`, [id_reporte, fechaFinal, recompensa || 0.00]);
        await db.execute(`INSERT INTO fotografia (url_imagen, id_reporte) VALUES (?, ?)`, [url_imagen, id_reporte]);

        await Coincidencia.generarCoincidenciasAutomaticas(id_reporte, 'PERDIDA');

        return res.json({ status: 'success', message: 'Reporte de pérdida creado correctamente', id_reporte });
    } catch (error) {
        console.error('Error al crear reporte de perdida:', error);
        return res.status(500).json({ status: 'error', message: 'Error interno al crear el reporte de pérdida' });
    }
};

// Crear nuevo reporte de hallazgo (Estado inicial: HALLADO)
exports.crearReporteHallazgo = async (req, res) => {
    try {
        const { especie, raza, color_principal, color_secundario, tamano, descripcion, zona, fecha_hallazgo, fecha_evento, id_usuario } = req.body;
        const url_imagen = req.file ? req.file.path : '/uploads/default.jpg';
        const fechaFinal = fecha_hallazgo || fecha_evento || new Date();

        const [resMascota] = await db.execute(`
            INSERT INTO reporte_mascota (especie, raza, color_principal, color_secundario, tamano, descripcion, zona, estado, id_usuario)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'HALLADO', ?)
        `, [especie, raza, color_principal, color_secundario || 'NO_APLICA', tamano, descripcion, zona, id_usuario]);

        const id_reporte = resMascota.insertId;

        await db.execute(`INSERT INTO reporte_hallazgo (id_reporte, fecha_hallazgo) VALUES (?, ?)`, [id_reporte, fechaFinal]);
        await db.execute(`INSERT INTO fotografia (url_imagen, id_reporte) VALUES (?, ?)`, [url_imagen, id_reporte]);

        await Coincidencia.generarCoincidenciasAutomaticas(id_reporte, 'HALLAZGO');

        return res.json({ status: 'success', message: 'Reporte de hallazgo creado correctamente', id_reporte });
    } catch (error) {
        console.error('Error al crear reporte de hallazgo:', error);
        return res.status(500).json({ status: 'error', message: 'Error interno al crear el reporte de hallazgo' });
    }
};

// Marcar un reporte como resuelto / encontrado por el usuario
exports.marcarResuelto = async (req, res) => {
    try {
        const { id } = req.params;

        const [coincidencias] = await db.execute(
            `SELECT id_coincidencia FROM coincidencia WHERE id_reporte_perdida = ? OR id_reporte_hallazgo = ?`, 
            [id, id]
        );

        if (coincidencias.length > 0) {
            const idsCoincidencia = coincidencias.map(c => c.id_coincidencia);
            const placeholders = idsCoincidencia.map(() => '?').join(',');

            await db.execute(
                `UPDATE mensaje_contacto SET id_coincidencia = NULL WHERE id_coincidencia IN (${placeholders})`, 
                idsCoincidencia
            );

            await db.execute(
                `DELETE FROM coincidencia WHERE id_coincidencia IN (${placeholders})`, 
                idsCoincidencia
            );
        }

        await db.execute(`UPDATE reporte_mascota SET estado = 'RESUELTO' WHERE id_reporte = ?`, [id]);

        return res.json({ status: 'success', message: 'Reporte marcado como resuelto correctamente' });
    } catch (error) {
        console.error('Error al marcar reporte resuelto:', error);
        return res.status(500).json({ status: 'error', message: 'Error interno al cambiar estado' });
    }
};

// Actualizar / Editar un reporte existente
exports.actualizarReporte = async (req, res) => {
    try {
        const { id_reporte } = req.params;
        const { especie, raza, color_principal, color_secundario, tamano, descripcion, zona, fecha_evento, recompensa } = req.body;

        await db.execute(`
            UPDATE reporte_mascota 
            SET especie = ?, raza = ?, color_principal = ?, color_secundario = ?, 
                tamano = ?, descripcion = ?, zona = ?, fecha_reporte = NOW()
            WHERE id_reporte = ?
        `, [especie, raza, color_principal, color_secundario || 'NO_APLICA', tamano, descripcion, zona, id_reporte]);

        if (fecha_evento) {
            await db.execute(`UPDATE reporte_perdida SET fecha_perdida = ?, recompensa = ? WHERE id_reporte = ?`, [fecha_evento, recompensa || 0.00, id_reporte]);
            await db.execute(`UPDATE reporte_hallazgo SET fecha_hallazgo = ? WHERE id_reporte = ?`, [fecha_evento, id_reporte]);
        }

        if (req.file) {
            const url_imagen = req.file.path;
            await db.execute(`
                INSERT INTO fotografia (url_imagen, id_reporte) VALUES (?, ?)
                ON DUPLICATE KEY UPDATE url_imagen = VALUES(url_imagen)
            `, [url_imagen, id_reporte]);
        }

        const [rows] = await db.execute(`SELECT estado FROM reporte_mascota WHERE id_reporte = ?`, [id_reporte]);
        const estadoActual = rows.length > 0 ? rows[0].estado : 'PERDIDO';
        const tipoReporte = (estadoActual === 'HALLADO') ? 'HALLAZGO' : 'PERDIDA';

        await Coincidencia.generarCoincidenciasAutomaticas(id_reporte, tipoReporte);

        return res.json({ status: 'success', message: 'Reporte actualizado y coincidencias recalculadas' });
    } catch (error) {
        console.error('Error al actualizar el reporte:', error);
        return res.status(500).json({ status: 'error', message: 'Error interno al actualizar el reporte' });
    }
};

// Borrado logico por Administrador: Cambia a estado CERRADO
exports.eliminarReporteFisico = async (req, res) => {
    try {
        const { id_reporte } = req.params;
        
        await db.execute(`UPDATE reporte_mascota SET estado = 'CERRADO' WHERE id_reporte = ?`, [id_reporte]);

        const [coincidencias] = await db.execute(
            `SELECT id_coincidencia FROM coincidencia WHERE id_reporte_perdida = ? OR id_reporte_hallazgo = ?`, 
            [id_reporte, id_reporte]
        );

        if (coincidencias.length > 0) {
            const idsCoincidencia = coincidencias.map(c => c.id_coincidencia);
            const placeholders = idsCoincidencia.map(() => '?').join(',');

            await db.execute(
                `UPDATE mensaje_contacto SET id_coincidencia = NULL WHERE id_coincidencia IN (${placeholders})`, 
                idsCoincidencia
            );

            await db.execute(
                `DELETE FROM coincidencia WHERE id_coincidencia IN (${placeholders})`, 
                idsCoincidencia
            );
        }

        return res.json({ status: 'success', message: 'Reporte cerrado correctamente por Administrador' });
    } catch (error) {
        console.error('Error al eliminar reporte:', error);
        return res.status(500).json({ status: 'error', message: 'Error interno al eliminar el reporte' });
    }
};