const db = require('../config/db');

class Coincidencia {
    constructor(id_coincidencia, fecha_generacion, porcentaje_similitud, estado_coincidencia, id_reporte_perdida, id_reporte_hallazgo) {
        this.id_coincidencia = id_coincidencia;
        this.fecha_generacion = fecha_generacion;
        this.porcentaje_similitud = porcentaje_similitud;
        this.estado_coincidencia = estado_coincidencia;
        this.id_reporte_perdida = id_reporte_perdida;
        this.id_reporte_hallazgo = id_reporte_hallazgo;
    }

    /* Algoritmo de calculo de similitud con umbral flexible del 50% */
    static calcularSimilitud(reporteA, reporteB) {
        let puntosTotal = 100;
        let puntosCoincidentes = 0;

        const norm = (txt) => (txt || '').toString().trim().toLowerCase();

        /* Regla estricta RN04: Misma especie obligatoria */
        if (norm(reporteA.especie) !== norm(reporteB.especie)) {
            return 0;
        }

        /* 1. Raza (35 pts) - Coincidencia exacta o parcial */
        const razaA = norm(reporteA.raza);
        const razaB = norm(reporteB.raza);
        if (razaA === razaB) {
            puntosCoincidentes += 35;
        } else if (razaA.includes(razaB) || razaB.includes(razaA) || razaA.includes('criollo') || razaB.includes('criollo')) {
            puntosCoincidentes += 25;
        }

        /* 2. Color Principal (30 pts) */
        const colorA = norm(reporteA.color_principal);
        const colorB = norm(reporteB.color_principal);
        if (colorA === colorB) {
            puntosCoincidentes += 30;
        } else if (colorA.includes(colorB.split('/')[0].trim()) || colorB.includes(colorA.split('/')[0].trim())) {
            puntosCoincidentes += 20;
        }

        /* 3. Zona / Localidad (20 pts) */
        if (norm(reporteA.zona) === norm(reporteB.zona)) {
            puntosCoincidentes += 20;
        }

        /* 4. Tamaño (15 pts) */
        if (norm(reporteA.tamano) === norm(reporteB.tamano)) {
            puntosCoincidentes += 15;
        }

        return Number((puntosCoincidentes / puntosTotal).toFixed(2));
    }

    /* Generador automatico invocado al crear o editar reportes */
    static async generarCoincidenciasAutomaticas(idReporteNuevo, tipoNuevo) {
        try {
            const [reporteNuevoArray] = await db.execute(`SELECT * FROM reporte_mascota WHERE id_reporte = ?`, [idReporteNuevo]);
            if (reporteNuevoArray.length === 0 || reporteNuevoArray[0].estado === 'ENCONTRADO' || reporteNuevoArray[0].estado === 'RESUELTO') {
                return;
            }
            const reporteNuevo = reporteNuevoArray[0];

            let sqlExistentes = '';
            
            if (tipoNuevo === 'HALLAZGO') {
                sqlExistentes = `SELECT * FROM reporte_mascota WHERE estado = 'PERDIDO' AND id_reporte != ?`;
            } else {
                sqlExistentes = `SELECT * FROM reporte_mascota WHERE estado IN ('PERDIDO', 'ACTIVO') AND id_reporte != ?`;
            }

            const [reportesExistentes] = await db.execute(sqlExistentes, [idReporteNuevo]);

            for (const reporteExistente of reportesExistentes) {
                let reportePerdida, reporteHallazgo;

                if (tipoNuevo === 'HALLAZGO') {
                    reportePerdida = reporteExistente;
                    reporteHallazgo = reporteNuevo;
                } else {
                    reportePerdida = reporteNuevo;
                    reporteHallazgo = reporteExistente;
                }

                const similitud = this.calcularSimilitud(reportePerdida, reporteHallazgo);

                if (similitud >= 0.50) {
                    const sqlInsert = `
                        INSERT INTO coincidencia (porcentaje_similitud, id_reporte_perdida, id_reporte_hallazgo) 
                        VALUES (?, ?, ?)
                        ON DUPLICATE KEY UPDATE porcentaje_similitud = VALUES(porcentaje_similitud)`;
                    await db.execute(sqlInsert, [similitud, reportePerdida.id_reporte, reporteHallazgo.id_reporte]);
                }
            }
        } catch (error) {
            console.error('Error al generar coincidencias automaticas:', error);
        }
    }
}

module.exports = Coincidencia;