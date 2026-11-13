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

    /* Algoritmo de calculo de similitud con validacion fisica obligatoria */
    static calcularSimilitud(reporteA, reporteB) {
        let puntosTotal = 100;
        let puntosCoincidentes = 0;

        const norm = (txt) => (txt || '').toString().trim().toLowerCase();

        /* Regla estricta RN04: Misma especie obligatoria */
        if (norm(reporteA.especie) !== norm(reporteB.especie)) {
            return 0;
        }

        /* 1. Raza (35 pts) - Solo coincidencia real */
        const razaA = norm(reporteA.raza);
        const razaB = norm(reporteB.raza);
        let coincideRaza = false;

        if (razaA === razaB) {
            puntosCoincidentes += 35;
            coincideRaza = true;
        } else if (razaA.includes(razaB) || razaB.includes(razaA)) {
            puntosCoincidentes += 20;
            coincideRaza = true;
        }

        /* 2. Color Principal y Secundario (35 pts en total) */
        const colorP_A = norm(reporteA.color_principal);
        const colorP_B = norm(reporteB.color_principal);
        const colorS_A = norm(reporteA.color_secundario);
        const colorS_B = norm(reporteB.color_secundario);
        let coincideColor = false;

        if (colorP_A === colorP_B) {
            puntosCoincidentes += 25;
            coincideColor = true;
        } else if (
            colorP_A.includes(colorP_B.split('/')[0].trim()) ||
            colorP_B.includes(colorP_A.split('/')[0].trim()) ||
            (colorS_A !== 'no_aplica' && colorS_A === colorP_B) ||
            (colorS_B !== 'no_aplica' && colorS_B === colorP_A)
        ) {
            puntosCoincidentes += 15;
            coincideColor = true;
        }

        /* Coincidencia en color secundario */
        if (colorS_A !== 'no_aplica' && colorS_B !== 'no_aplica' && colorS_A === colorS_B) {
            puntosCoincidentes += 10;
            coincideColor = true;
        }

        /* Filtro de coherencia visual: debe coincidir al menos en raza o en color */
        if (!coincideRaza && !coincideColor) {
            return 0;
        }

        /* 3. Zona / Localidad (20 pts) */
        if (norm(reporteA.zona) === norm(reporteB.zona)) {
            puntosCoincidentes += 20;
        }

        /* 4. Tamaño (10 pts) */
        if (norm(reporteA.tamano) === norm(reporteB.tamano)) {
            puntosCoincidentes += 10;
        }

        return Number((puntosCoincidentes / puntosTotal).toFixed(2));
    }

    /* Generador automatico invocado al crear o editar reportes */
    static async generarCoincidenciasAutomaticas(idReporteNuevo, tipoNuevo) {
        try {
            const [reporteNuevoArray] = await db.execute(`SELECT * FROM reporte_mascota WHERE id_reporte = ?`, [idReporteNuevo]);
            
            /* Solo detener si el reporte no existe o ya fue cerrado/reunido */
            if (reporteNuevoArray.length === 0 || ['ENCONTRADO', 'RESUELTO', 'CERRADO'].includes(reporteNuevoArray[0].estado)) {
                return;
            }
            const reporteNuevo = reporteNuevoArray[0];

            let sqlExistentes = '';
            
            /* Cruzar HALLAZGO ('HALLADO') contra 'PERDIDO', y PERDIDA ('PERDIDO') contra 'HALLADO' */
            if (tipoNuevo === 'HALLAZGO') {
                sqlExistentes = `SELECT * FROM reporte_mascota WHERE estado = 'PERDIDO' AND id_reporte != ? AND id_usuario != ?`;
            } else {
                sqlExistentes = `SELECT * FROM reporte_mascota WHERE estado = 'HALLADO' AND id_reporte != ? AND id_usuario != ?`;
            }

            const [reportesExistentes] = await db.execute(sqlExistentes, [idReporteNuevo, reporteNuevo.id_usuario]);

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

                if (similitud >= 0.60) {
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