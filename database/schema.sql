USE railway;

/* 1. Eliminar tablas anteriores si existen */
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS auditoria_reporte;
DROP TABLE IF EXISTS mensaje_contacto;
DROP TABLE IF EXISTS coincidencia;
DROP TABLE IF EXISTS fotografia;
DROP TABLE IF EXISTS reporte_hallazgo;
DROP TABLE IF EXISTS reporte_perdida;
DROP TABLE IF EXISTS reporte_mascota;
DROP TABLE IF EXISTS entidad_reportante;
DROP TABLE IF EXISTS usuario;
SET FOREIGN_KEY_CHECKS = 1;

/* 2. Creacion de Tablas */
CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo_electronico VARCHAR(150) NOT NULL UNIQUE,
    telefono VARCHAR(20) NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    tipo_usuario ENUM('PARTICULAR', 'ENTIDAD', 'ADMIN') NOT NULL DEFAULT 'PARTICULAR',
    direccion VARCHAR(150) NULL,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('ACTIVO', 'INACTIVO', 'SUSPENDIDO') NOT NULL DEFAULT 'ACTIVO'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE entidad_reportante (
    id_entidad INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,
    nombre_entidad VARCHAR(100) NOT NULL,
    tipo_entidad ENUM('FUNDACION', 'REFUGIO', 'VETERINARIA') NOT NULL,
    estado_validacion ENUM('PENDIENTE', 'ACTIVA', 'INACTIVA') NOT NULL DEFAULT 'PENDIENTE',
    CONSTRAINT fk_entidad_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE reporte_mascota (
    id_reporte INT AUTO_INCREMENT PRIMARY KEY,
    especie ENUM('PERRO', 'GATO', 'OTRO') NOT NULL,
    raza VARCHAR(50) NULL,
    color_principal VARCHAR(50) NOT NULL,
    color_secundario VARCHAR(50) NULL DEFAULT 'NO_APLICA',
    tamano ENUM('PEQUENO', 'MEDIANO', 'GRANDE') NOT NULL,
    descripcion TEXT NULL,
    zona VARCHAR(50) NOT NULL,
    fecha_reporte DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('PERDIDO', 'ENCONTRADO', 'RESUELTO', 'CERRADO') NOT NULL DEFAULT 'PERDIDO',
    id_usuario INT NOT NULL,
    CONSTRAINT fk_reporte_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE reporte_perdida (
    id_reporte INT PRIMARY KEY,
    fecha_perdida DATE NOT NULL,
    recompensa DECIMAL(10,2) DEFAULT 0.00,
    CONSTRAINT fk_perdida_reporte FOREIGN KEY (id_reporte) REFERENCES reporte_mascota(id_reporte) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE reporte_hallazgo (
    id_reporte INT PRIMARY KEY,
    fecha_hallazgo DATE NOT NULL,
    id_entidad INT NULL,
    CONSTRAINT fk_hallazgo_reporte FOREIGN KEY (id_reporte) REFERENCES reporte_mascota(id_reporte) ON DELETE CASCADE,
    CONSTRAINT fk_hallazgo_entidad FOREIGN KEY (id_entidad) REFERENCES entidad_reportante(id_entidad)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE fotografia (
    id_foto INT AUTO_INCREMENT PRIMARY KEY,
    url_imagen VARCHAR(300) NOT NULL,
    fecha_carga DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_reporte INT NOT NULL,
    CONSTRAINT fk_foto_reporte FOREIGN KEY (id_reporte) REFERENCES reporte_mascota(id_reporte) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE coincidencia (
    id_coincidencia INT AUTO_INCREMENT PRIMARY KEY,
    fecha_generacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    porcentaje_similitud DECIMAL(3,2) NOT NULL,
    estado_coincidencia ENUM('PENDIENTE', 'CONFIRMADA', 'DESCARTADA') NOT NULL DEFAULT 'PENDIENTE',
    id_reporte_perdida INT NOT NULL,
    id_reporte_hallazgo INT NOT NULL,
    CONSTRAINT uq_coincidencia UNIQUE (id_reporte_perdida, id_reporte_hallazgo),
    CONSTRAINT fk_coincidencia_perdida FOREIGN KEY (id_reporte_perdida) REFERENCES reporte_perdida(id_reporte),
    CONSTRAINT fk_coincidencia_hallazgo FOREIGN KEY (id_reporte_hallazgo) REFERENCES reporte_hallazgo(id_reporte)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE mensaje_contacto (
    id_mensaje INT AUTO_INCREMENT PRIMARY KEY,
    fecha_envio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    contenido_mensaje TEXT NOT NULL,
    medio_contacto ENUM('PLATAFORMA', 'EMAIL', 'TELEFONO') NOT NULL DEFAULT 'PLATAFORMA',
    estado_lectura TINYINT(1) NOT NULL DEFAULT 0,
    id_usuario_emisor INT NOT NULL,
    id_usuario_receptor INT NULL,
    id_coincidencia INT NULL,
    id_reporte INT NULL,
    CONSTRAINT fk_mensaje_emisor FOREIGN KEY (id_usuario_emisor) REFERENCES usuario(id_usuario),
    CONSTRAINT fk_mensaje_receptor FOREIGN KEY (id_usuario_receptor) REFERENCES usuario(id_usuario),
    CONSTRAINT fk_mensaje_coincidencia FOREIGN KEY (id_coincidencia) REFERENCES coincidencia(id_coincidencia),
    CONSTRAINT fk_mensaje_reporte FOREIGN KEY (id_reporte) REFERENCES reporte_mascota(id_reporte)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE auditoria_reporte (
    id_auditoria INT AUTO_INCREMENT PRIMARY KEY,
    id_reporte INT NOT NULL,
    estado_anterior VARCHAR(20) NOT NULL,
    estado_nuevo VARCHAR(20) NOT NULL,
    fecha_cambio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    usuario_accion VARCHAR(100) DEFAULT 'SISTEMA'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* 3. Triggers */
DROP TRIGGER IF EXISTS trg_auditoria_estado_reporte;
DELIMITER //
CREATE TRIGGER trg_auditoria_estado_reporte
AFTER UPDATE ON reporte_mascota
FOR EACH ROW
BEGIN
    IF OLD.estado != NEW.estado THEN
        INSERT INTO auditoria_reporte (id_reporte, estado_anterior, estado_nuevo)
        VALUES (NEW.id_reporte, OLD.estado, NEW.estado);
    END IF;
END //
DELIMITER ;

DROP TRIGGER IF EXISTS trg_validar_recompensa;
DELIMITER //
CREATE TRIGGER trg_validar_recompensa
BEFORE INSERT ON reporte_perdida
FOR EACH ROW
BEGIN
    IF NEW.recompensa < 0 THEN
        SET NEW.recompensa = 0.00;
    END IF;
END //
DELIMITER ;

/* 4. Funciones */
DROP FUNCTION IF EXISTS fn_coincidencia_zona;
DELIMITER //
CREATE FUNCTION fn_coincidencia_zona(zona1 VARCHAR(50), zona2 VARCHAR(50))
RETURNS DECIMAL(3,2)
DETERMINISTIC
BEGIN
    IF LOWER(TRIM(zona1)) = LOWER(TRIM(zona2)) THEN
        RETURN 0.20;
    ELSE
        RETURN 0.00;
    END IF;
END //
DELIMITER ;

/* 5. Stored Procedures */
DROP PROCEDURE IF EXISTS sp_cerrar_reporte;
DELIMITER //
CREATE PROCEDURE sp_cerrar_reporte(
    IN p_id_reporte INT,
    IN p_nuevo_estado ENUM('ENCONTRADO', 'RESUELTO', 'CERRADO')
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
        UPDATE mensaje_contacto 
        SET id_coincidencia = NULL 
        WHERE id_coincidencia IN (
            SELECT id_coincidencia FROM coincidencia 
            WHERE id_reporte_perdida = p_id_reporte OR id_reporte_hallazgo = p_id_reporte
        );

        DELETE FROM coincidencia 
        WHERE id_reporte_perdida = p_id_reporte OR id_reporte_hallazgo = p_id_reporte;

        UPDATE reporte_mascota 
        SET estado = p_nuevo_estado 
        WHERE id_reporte = p_id_reporte;
    COMMIT;
END //
DELIMITER ;