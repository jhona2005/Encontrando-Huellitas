-- ============================================================================
-- ENCONTRANDO HUELLITAS - CONSULTAS SQL DE AUDITORIA, METRICAS Y VERIFICACION
-- ============================================================================

USE railway;

-- 1. RESUMEN GENERAL DE REPORTES POR ESTADO
-- Muestra el total de mascotas perdidas, halladas activas, casos resueltos y cerrados por admin
SELECT 
    estado,
    COUNT(*) AS total_reportes
FROM reporte_mascota
GROUP BY estado
ORDER BY total_reportes DESC;

-- 2. DISTRIBUCION DE REPORTES POR ESPECIE Y ESTADO
SELECT 
    especie,
    estado,
    COUNT(*) AS cantidad
FROM reporte_mascota
GROUP BY especie, estado
ORDER BY especie, estado;

-- 3. TOP DE ZONAS / LOCALIDADES CON MAYOR NUMERO DE REPORTES
SELECT 
    zona,
    COUNT(*) AS total_casos,
    SUM(CASE WHEN estado = 'PERDIDO' THEN 1 ELSE 0 END) AS perdidos_activos,
    SUM(CASE WHEN estado = 'HALLADO' THEN 1 ELSE 0 END) AS hallados_activos,
    SUM(CASE WHEN estado = 'RESUELTO' THEN 1 ELSE 0 END) AS casos_resueltos
FROM reporte_mascota
WHERE estado != 'CERRADO'
GROUP BY zona
ORDER BY total_casos DESC;

-- 4. CUENTAS DE USUARIOS REGISTRADOS POR TIPO Y ESTADO
SELECT 
    tipo_usuario,
    estado,
    COUNT(*) AS total_usuarios
FROM usuario
GROUP BY tipo_usuario, estado;

-- 5. LISTADO DETALLADO DE USUARIOS Y CANTIDAD DE PUBLICACIONES REALIZADAS
SELECT 
    u.id_usuario,
    u.nombre,
    u.correo_electronico,
    u.tipo_usuario,
    COUNT(rm.id_reporte) AS total_publicaciones
FROM usuario u
LEFT JOIN reporte_mascota rm ON u.id_usuario = rm.id_usuario
GROUP BY u.id_usuario, u.nombre, u.correo_electronico, u.tipo_usuario
ORDER BY total_publicaciones DESC;

-- 6. COINCIDENCIAS DETECTADAS POR EL SISTEMA (DETALLE COMPLETO)
-- Muestra el porcentaje de similitud y los datos de ambas partes involucradas
SELECT 
    c.id_coincidencia,
    CONCAT(ROUND(c.porcentaje_similitud * 100), '%') AS similitud,
    c.estado_coincidencia,
    c.fecha_generacion,
    rm_p.id_reporte AS id_perdida,
    rm_p.especie,
    rm_p.raza AS raza_perdida,
    rm_p.zona AS zona_perdida,
    u_p.nombre AS dueno_mascota,
    rm_h.id_reporte AS id_hallazgo,
    rm_h.raza AS raza_hallada,
    rm_h.zona AS zona_hallazgo,
    u_h.nombre AS reportante_hallazgo
FROM coincidencia c
INNER JOIN reporte_mascota rm_p ON c.id_reporte_perdida = rm_p.id_reporte
INNER JOIN usuario u_p ON rm_p.id_usuario = u_p.id_usuario
INNER JOIN reporte_mascota rm_h ON c.id_reporte_hallazgo = rm_h.id_reporte
INNER JOIN usuario u_h ON rm_h.id_usuario = u_h.id_usuario
ORDER BY c.porcentaje_similitud DESC, c.fecha_generacion DESC;

-- 7. HISTORIAL DE MENSAJES INTERCAMBIADOS EN LA PLATAFORMA
SELECT 
    m.id_mensaje,
    m.fecha_envio,
    u_e.nombre AS emisor,
    u_r.nombre AS receptor,
    m.id_coincidencia,
    m.id_reporte,
    m.contenido_mensaje
FROM mensaje_contacto m
INNER JOIN usuario u_e ON m.id_usuario_emisor = u_e.id_usuario
LEFT JOIN usuario u_r ON m.id_usuario_receptor = u_r.id_usuario
ORDER BY m.fecha_envio DESC;

-- 8. REGISTRO DE AUDITORIA DE CAMBIOS DE ESTADO (DISPARADO POR TRIGGER)
SELECT 
    a.id_auditoria,
    a.id_reporte,
    rm.especie,
    rm.raza,
    a.estado_anterior,
    a.estado_nuevo,
    a.fecha_cambio,
    a.usuario_accion
FROM auditoria_reporte a
INNER JOIN reporte_mascota rm ON a.id_reporte = rm.id_reporte
ORDER BY a.fecha_cambio DESC;

-- 9. VERIFICACION DE ALMACENAMIENTO DE IMAGENES (NUBE CLOUDINARY VS LOCAL)
SELECT 
    CASE 
        WHEN url_imagen LIKE 'https://res.cloudinary.com%' THEN 'Nube (Cloudinary)'
        ELSE 'Local (/uploads)'
    END AS origen_almacenamiento,
    COUNT(*) AS total_fotografias
FROM fotografia
GROUP BY origen_almacenamiento;