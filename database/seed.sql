USE railway;

/* Desactivar temporalmente restricciones de clave foránea */
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE auditoria_reporte;
TRUNCATE TABLE mensaje_contacto;
TRUNCATE TABLE coincidencia;
TRUNCATE TABLE fotografia;
TRUNCATE TABLE reporte_hallazgo;
TRUNCATE TABLE reporte_perdida;
TRUNCATE TABLE reporte_mascota;
TRUNCATE TABLE entidad_reportante;
TRUNCATE TABLE usuario;
SET FOREIGN_KEY_CHECKS = 1;

/* 1. Inserción de Usuarios */
INSERT INTO usuario (id_usuario, nombre, correo_electronico, telefono, contrasena, tipo_usuario, direccion, fecha_registro, estado) VALUES
(1, 'Jhonatan Beltrán', 'jhonabeltran2005@gmail.com', '3136418176', '1023163164', 'ADMIN', 'Cra. 12f sur #30-15', '2026-10-17 22:11:52', 'ACTIVO'),
(10, 'Camila Andrea Rodríguez', 'camila.rodriguez@gmail.com', '3102345678', '123456', 'PARTICULAR', 'Cra. 15 #118-45', '2026-10-18 18:08:22', 'ACTIVO'),
(11, 'Santiago Gómez Silva', 'santiago.gomez@hotmail.com', '3159876543', '123456', 'PARTICULAR', 'Cl. 63 #24-18', '2026-10-18 18:08:22', 'ACTIVO'),
(12, 'Valeria Martínez Ríos', 'valeria.martinez@outlook.com', '3201112233', '123456', 'PARTICULAR', 'Cl. 140 #9-30', '2026-10-18 18:08:22', 'ACTIVO'),
(13, 'Fundación Huellitas Sanas', 'contacto@huellitassanas.org', '3004445566', '123456', 'ENTIDAD', 'Av. Suba #100-15', '2026-10-18 18:08:22', 'ACTIVO'),
(14, 'Mateo Felipe Morales', 'mateo.morales@yahoo.com', '3128889900', '123456', 'PARTICULAR', 'Cra. 7 #45-10', '2026-10-18 18:08:22', 'ACTIVO'),
(15, 'Daniela López Castro', 'daniela.lopez@gmail.com', '3176543210', '123456', 'PARTICULAR', 'Cl. 26 #68-20', '2026-10-18 18:08:22', 'ACTIVO'),
(16, 'Alejandro Vargas Niño', 'alejandro.vargas@gmail.com', '3113334455', '123456', 'PARTICULAR', 'Cra. 50 #3-15', '2026-10-18 18:08:22', 'ACTIVO'),
(17, 'Refugio Amor Animal', 'refugioamoranimal@gmail.com', '3017778899', '123456', 'ENTIDAD', 'Tv. 78 #45-12 Sur', '2026-10-18 18:08:22', 'ACTIVO'),
(18, 'Carolina Ospina Gutiérrez', 'carolina.ospina@gmail.com', '3182223344', '123456', 'PARTICULAR', 'Cl. 8 Sur #27-50', '2026-10-18 18:08:22', 'ACTIVO'),
(19, 'Gabriel José Torres', 'gabriel.torres@gmail.com', '3135556677', '123456', 'PARTICULAR', 'Cra. 100 #22-30', '2026-10-18 18:08:22', 'ACTIVO'),
(20, 'Natalia Sofía Salamanca', 'natalia.salamanca@gmail.com', '3167890123', '123456', 'PARTICULAR', 'Cl. 170 #15-30', '2026-10-18 18:44:02', 'ACTIVO');

/* 2. Inserción de Reporte Base de Mascotas */
INSERT INTO reporte_mascota (id_reporte, especie, raza, color_principal, color_secundario, tamano, descripcion, zona, fecha_reporte, estado, id_usuario) VALUES
(1, 'GATO', 'Persa', 'Gris / Plateado', 'Blanco', 'PEQUENO', 'Se perdió cerca de Bosques de San Carlos, se llama Antonio.', 'Rafael Uribe Uribe', '2026-10-17 23:35:40', 'PERDIDO', 1),
(2, 'PERRO', 'Golden Retriever', 'Dorado / Amarillo', 'NO_APLICA', 'GRANDE', 'Responde al nombre de Lucas. Llevaba una pañoleta azul al momento de perderse cerca del parque Unicentro.', 'Usaquén', '2026-10-18 18:12:26', 'ENCONTRADO', 10),
(3, 'GATO', 'Siamés', 'Crema / Beis', 'Café / Marrón', 'MEDIANO', 'Se llama Mia. Tiene ojos azules muy claros y la cola oscura. Se escapó por la ventana del apartamento en el barrio 7 de Agosto.', 'Barrios Unidos', '2026-11-02 18:49:42', 'PERDIDO', 11),
(4, 'PERRO', 'Beagle', 'Manchado / Pío', 'Café / Marrón', 'MEDIANO', 'Nombre: Toby. Beagle tricolor (blanco, negro y café). Tiene microchip de identificación y collar rojo con su placa de datos.', 'Suba', '2026-10-18 18:16:51', 'PERDIDO', 12),
(5, 'PERRO', 'Criollo / Mestizo', 'Negro', 'Blanco', 'MEDIANO', 'Perro rescatado en proceso de adopción, responde al nombre de Apolo. Se asustó con la pólvora y corrió hacia la zona de Rincón de Suba.', 'Suba', '2026-11-02 21:13:56', 'PERDIDO', 13),
(6, 'GATO', 'Angora', 'Blanco', 'NO_APLICA', 'PEQUENO', 'Se llama Copito. Gato de pelaje largo totalmente blanco, ojos de distinto color (uno azul y uno verde). Perdió cerca a la Zona G.', 'Chapinero', '2026-11-02 18:47:37', 'ENCONTRADO', 14),
(7, 'PERRO', 'Bulldog Francés', 'Atigrado', 'Blanco', 'PEQUENO', 'Se llama Bruno. Requiere medicamento diario para alergia en la piel. Visto por última vez cerca al Park Way.', 'Teusaquillo', '2026-10-18 18:30:41', 'RESUELTO', 15),
(8, 'PERRO', 'Pastor Alemán', 'Café / Marrón', 'Negro', 'GRANDE', 'Responde por Thor. Muestra una cicatriz pequeña en la oreja izquierda. Perdió rastro cerca a Plaza de Las Américas.', 'Kennedy', '2026-10-18 18:34:12', 'CERRADO', 16),
(9, 'GATO', 'Criollo / Mestizo', 'Naranja / Anaranjado', 'Blanco', 'PEQUENO', 'Nombre temporal: Garfield. Gato macho castrado con marcas de rayas naranjas y pecho blanco. Se salió de las instalaciones del refugio en el barrio Meissen.', 'Ciudad Bolívar', '2026-10-18 18:36:50', 'PERDIDO', 17),
(10, 'PERRO', 'Poodle / Caniche', 'Gris / Plateado', 'NO_APLICA', 'PEQUENO', 'Se llama Pelusa. Poodle de edad avanzada (10 años), casi ciego del ojo derecho. Perdió rastro en el barrio 20 de Julio.', 'San Cristóbal', '2026-10-18 18:39:57', 'PERDIDO', 18),
(11, 'PERRO', 'Siberian Husky', 'Gris / Plateado', 'Blanco', 'GRANDE', 'Responde al nombre de Balto. Husky con ojos azules intensos y arnés de paseo color rojo con pechera negra. Extraviado cerca al Parque Central de Fontibón.', 'Fontibón', '2026-10-18 18:42:54', 'PERDIDO', 19),
(12, 'PERRO', 'Shih Tzu', 'Blanco', 'Café / Marrón', 'PEQUENO', 'Se llama Moti. Es un Shih Tzu pequeño de pelaje blanco con manchas café en las orejas y en el lomo. Llevaba un arnés rosado con su placa de identificación. Se perdió cerca del parque de Toberín.', 'Usaquén', '2026-10-18 18:47:07', 'ENCONTRADO', 20),
(13, 'PERRO', 'Shih Tzu', 'Blanco', 'Café / Marrón', 'PEQUENO', 'Encontrado perrito pequeño vagando por el parque Toberín. Llevaba un arnés rosado pero sin placa con teléfono. Muy dócil.', 'Usaquén', '2026-10-18 18:53:55', 'ENCONTRADO', 13),
(14, 'PERRO', 'Golden Retriever', 'Dorado / Amarillo', 'NO_APLICA', 'GRANDE', 'Visto y resguardado en portería cerca a Unicentro. Tiene pañoleta azul en el cuello. Responde bien a los humanos.', 'Usaquén', '2026-10-19 21:31:29', 'ENCONTRADO', 13),
(15, 'GATO', 'Angora', 'Blanco', 'NO_APLICA', 'PEQUENO', 'Gato blanco peludo de ojos de distinto color resguardado en veterinaria de la Zona G. Se encuentra en buen estado de salud.', 'Chapinero', '2026-10-19 21:46:22', 'ENCONTRADO', 17),
(16, 'PERRO', 'Criollo / Mestizo', 'Negro', 'Café / Marrón', 'MEDIANO', 'Perrito mestizo de orejas caídas encontrado cerca del portal de la 80. Portaba un collar verde desgastado.', 'Engativá', '2026-10-19 22:00:25', 'PERDIDO', 16);

/* 3. Inserción de Detalles de Pérdida */
INSERT INTO reporte_perdida (id_reporte, fecha_perdida, recompensa) VALUES
(1, '2026-10-16', 100000.00),
(2, '2026-10-10', 200000.00),
(3, '2026-10-12', 150000.00),
(4, '2026-10-14', 300000.00),
(5, '2026-10-16', 0.00),
(6, '2026-10-10', 250000.00),
(7, '2026-10-13', 500000.00),
(8, '2026-10-08', 200000.00),
(9, '2026-10-16', 0.00),
(10, '2026-10-17', 100000.00),
(11, '2026-10-16', 400000.00),
(12, '2026-10-18', 250000.00);

/* 4. Inserción de Detalles de Hallazgo */
INSERT INTO reporte_hallazgo (id_reporte, fecha_hallazgo, id_entidad) VALUES
(13, '2026-10-18', NULL),
(14, '2026-10-11', NULL),
(15, '2026-10-12', NULL),
(16, '2026-10-17', NULL);

/* 5. Inserción de Fotografías */
INSERT INTO fotografia (id_foto, url_imagen, fecha_carga, id_reporte) VALUES
(1, '/uploads/1792298140873-604629174.jpg', '2026-10-17 23:35:40', 1),
(2, '/uploads/1792365146066-996977263.jpg', '2026-10-18 18:12:26', 2),
(3, '/uploads/1792365269868-89784706.jpg', '2026-10-18 18:14:29', 3),
(4, '/uploads/1792365411966-74091313.jpg', '2026-10-18 18:16:51', 4),
(5, '/uploads/1792365851930-425661732.jpg', '2026-10-18 18:24:11', 5),
(6, '/uploads/1792366011588-783252801.jpg', '2026-10-18 18:26:51', 6),
(7, '/uploads/1792366241046-531682989.jpg', '2026-10-18 18:30:41', 7),
(8, '/uploads/1792366452031-741690873.jpg', '2026-10-18 18:34:12', 8),
(9, '/uploads/1792366610391-559510676.jpg', '2026-10-18 18:36:50', 9),
(10, '/uploads/1792366797744-340162563.jpg', '2026-10-18 18:39:57', 10),
(11, '/uploads/1792366974045-249865282.jpg', '2026-10-18 18:42:54', 11),
(12, '/uploads/1792367227767-563841697.jpg', '2026-10-18 18:47:07', 12),
(13, '/uploads/1792367635162-723483811.jpg', '2026-10-18 18:53:55', 13),
(14, '/uploads/1792463489458-358282122.jpg', '2026-10-19 21:31:29', 14),
(15, '/uploads/1792464382688-996189056.jpg', '2026-10-19 21:46:22', 15),
(16, '/uploads/1792465225353-475350125.jpg', '2026-10-19 22:00:25', 16);

/* 6. Inserción de Coincidencias */
INSERT INTO coincidencia (id_coincidencia, fecha_generacion, porcentaje_similitud, estado_coincidencia, id_reporte_perdida, id_reporte_hallazgo) VALUES
(1, '2026-10-18 18:53:55', 1.00, 'PENDIENTE', 12, 13),
(4, '2026-10-19 21:35:41', 1.00, 'PENDIENTE', 2, 14),
(7, '2026-10-19 21:52:24', 1.00, 'PENDIENTE', 6, 15);

/* 7. Inserción de Mensajes de Contacto */
INSERT INTO mensaje_contacto (id_mensaje, fecha_envio, contenido_mensaje, medio_contacto, estado_lectura, id_usuario_emisor, id_usuario_receptor, id_coincidencia, id_reporte) VALUES
(1, '2026-10-19 00:00:30', 'Hola, creo que encontraste a mi mascota, se llama Moti.', 'PLATAFORMA', 0, 20, 13, 1, 12),
(2, '2026-10-19 00:01:29', 'Listo, te envío tu perrito Moti :D', 'PLATAFORMA', 0, 13, 20, 1, 12),
(3, '2026-10-19 21:48:26', 'Buenas, creo que ese es mi gato Copito!', 'PLATAFORMA', 0, 14, 17, NULL, 15),
(4, '2026-11-02 20:08:28', '[REVISIÓN ADMIN]: Buenas tardes, ¿me permites por favor un contacto para validar la integridad de la mascota?', 'PLATAFORMA', 0, 1, 14, NULL, 6),
(5, '2026-11-02 20:13:57', '[REVISIÓN ADMIN]: Buenas tardes, te escribe un administrador, ¿me regalas un medio para poder contactarme contigo? por favor.', 'PLATAFORMA', 0, 1, 14, NULL, 6),
(6, '2026-11-02 20:30:30', '¡Hola! Tenemos una coincidencia actualmente, ¿me podrías hablar sobre la mascota que reportaste?', 'PLATAFORMA', 0, 10, 13, 4, NULL),
(7, '2026-11-02 20:31:04', '¡Siiii! Es mi perrito :DDDD', 'PLATAFORMA', 0, 10, 13, 4, NULL),
(8, '2026-11-02 20:31:33', 'Dale, te envío a tu perrito.', 'PLATAFORMA', 0, 13, 10, 4, NULL),
(9, '2026-11-02 20:41:10', '¡Hola! Tenemos una coincidencia actualmente, ¿me podrías hablar sobre la mascota que reportaste?', 'PLATAFORMA', 0, 17, 14, 7, NULL),
(10, '2026-11-02 20:41:33', 'Danos tu contacto para devolverte a tu mascota, por favor.', 'PLATAFORMA', 0, 17, 14, 7, 15),
(11, '2026-11-02 20:42:02', '¡Mi Copito! :DDDDD', 'PLATAFORMA', 0, 14, 17, 7, 15),
(12, '2026-11-02 21:15:09', '[REVISIÓN ADMIN]: Por favor, dame info sobre la mascota.', 'PLATAFORMA', 0, 1, 13, NULL, 13);
/* 2. Inserción de Entidades Reportantes */
/* Inserción segura de Entidades Reportantes */
INSERT IGNORE INTO entidad_reportante (id_entidad, nombre_entidad, tipo_entidad, direccion, telefono, correo_contacto, estado_validacion) VALUES
(1, 'Fundación Huellitas Sanas', 'FUNDACION', 'Av. Suba #100-15', '3004445566', 'contacto@huellitassanas.org', 'ACTIVA'),
(2, 'Refugio Amor Animal', 'REFUGIO', 'Tv. 78 #45-12 Sur', '3017778899', 'refugioamoranimal@gmail.com', 'ACTIVA'),
(3, 'Veterinaria San Miguel', 'VETERINARIA', 'Av. Central #120-45', '3112223333', 'contacto@vetsanmiguel.com', 'ACTIVA');

/* 9. Inserción de Datos Iniciales de Auditoría de Reportes */
INSERT INTO auditoria_reporte (id_reporte, estado_anterior, estado_nuevo, fecha_cambio, usuario_accion) VALUES
(7, 'PERDIDO', 'RESUELTO', '2026-10-18 18:30:41', 'USUARIO'),
(8, 'PERDIDO', 'CERRADO', '2026-10-18 18:34:12', 'ADMINISTRADOR');

/* 2. Inserción Normalizada de Entidades Reportantes (Vinculadas por id_usuario) */
INSERT INTO entidad_reportante (id_entidad, id_usuario, nombre_entidad, tipo_entidad, estado_validacion) VALUES
(1, 13, 'Fundación Huellitas Sanas', 'FUNDACION', 'ACTIVA'),
(2, 17, 'Refugio Amor Animal', 'REFUGIO', 'ACTIVA');

/* 5. Inserción de Detalles de Hallazgo */
/* 5. Inserción de Detalles de Hallazgo */
INSERT IGNORE INTO reporte_hallazgo (id_reporte, fecha_hallazgo, id_entidad) VALUES
(13, '2026-10-18', 1),
(14, '2026-10-11', 1),
(15, '2026-10-12', 2),
(16, '2026-10-17', NULL);