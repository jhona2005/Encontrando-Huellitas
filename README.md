Encontrando Huellitas - Guia de Instalacion y Arquitectura

Este repositorio contiene la aplicacion Encontrando Huellitas, un sistema web desarrollado con Node.js, Express y MySQL para el reporte, busqueda, coincidencia automatica y contacto sobre mascotas perdidas y halladas.

Sigue esta guia paso a paso para clonar, configurar y ejecutar el proyecto en tu entorno local.

Requisitos Previos

Antes de comenzar, asegurate de tener instalado lo siguiente en tu equipo:

Node.js (version 18 o superior)

Git

MySQL Server (local mediante MySQL Workbench, XAMPP/WAMP o un servidor MySQL nativo)

Cuenta gratuita en Cloudinary (para almacenamiento persistente de fotografias)

Pasos para Ejecutar el Proyecto en Local

1. Clonar el Repositorio

Abre tu terminal o consola de comandos e ingresa:

git clone https://github.com/jhona2005/Encontrando-Huellitas.git
cd Encontrando-Huellitas/backend


2. Instalar Dependencias del Backend

Dentro de la carpeta backend, ejecuta el siguiente comando para descargar las librerias necesarias (express, mysql2, dotenv, cors, multer, cloudinary, multer-storage-cloudinary):

npm install


3. Configurar la Base de Datos MySQL

Abre tu gestor de base de datos (MySQL Workbench, phpMyAdmin o terminal de MySQL).

Crea la base de datos vacia ejecutando:

CREATE DATABASE huellitas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE huellitas;


Ejecuta el archivo del esquema de la base de datos ubicado en la carpeta database/schema.sql para crear las tablas, restricciones, procedimientos almacenados y activadores (triggers).

(Opcional) Carga los datos de prueba iniciales ejecutando el archivo database/seed.sql.

(Opcional) Puedes consultar metricas y auditorias del sistema utilizando el archivo database/consultas_auditoria.sql.

4. Configurar las Variables de Entorno (.env)

Dentro de la carpeta backend/, crea un archivo llamado .env (al mismo nivel que server.js) con las credenciales de tu base de datos local y tu cuenta de Cloudinary:

PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contrasena_local
DB_NAME=huellitas
DB_PORT=3306
DB_SSL=false
CLOUDINARY_URL=cloudinary://tu_api_key:tu_api_secret@tu_cloud_name


Nota: Reemplaza tu_contrasena_local por la clave de tu usuario root de MySQL local (si no tiene contrasena, dejalo en blanco). Asi mismo, reemplaza la cadena CLOUDINARY_URL con las credenciales de tu panel de Cloudinary.

5. Gestion de Imagenes y Carpeta uploads

Nuevas imagenes: El sistema utiliza Cloudinary mediante multer-storage-cloudinary para subir y optimizar automaticamente las fotografias nuevas en la nube, almacenando la URL publica segura directamente en MySQL.

Imagenes de prueba iniciales: Las fotografias incluidas por defecto en el script seed.sql se sirven de forma estatica desde la carpeta local backend/frontend/uploads. Asegurate de mantener esta carpeta intacta si cargas los datos iniciales de prueba.

6. Iniciar el Servidor

Desde la terminal, ubicado en la carpeta backend/, ejecuta:

npm run dev


o si prefieres usar Node directamente:

npm start


7. Abrir la Aplicacion

Abre tu navegador web e ingresa a la siguiente direccion:

http://localhost:3000

Arquitectura Funcional del Sistema

Ciclo de Vida y Estados de los Reportes

El sistema gestiona cinco estados diferenciados en la tabla reporte_mascota para garantizar la integridad del motor de coincidencias:

PERDIDO: Mascota extraviada publicada por su dueno (activa en busqueda y coincidencias).

HALLADO: Mascota encontrada en la via publica reportada por un ciudadano o entidad (activa en busqueda y coincidencias).

ENCONTRADO / RESUELTO: Caso cerrado exitosamente tras reunir a la mascota con su familia (sale de coincidencias activas).

CERRADO: Reporte dado de baja de forma logica por un usuario con rol ADMIN.

Motor de Coincidencias Automaticas

Al crear o editar un reporte activo (PERDIDO o HALLADO), el sistema cruza automaticamente la publicacion contra los reportes activos del tipo opuesto pertenecientes a otros usuarios, exigiendo coincidencia de especie y al menos una caracteristica fisica (raza o color) con un umbral minimo de similitud del 60%.

Resumen de Modificaciones Necesarias para Entorno Local

backend/.env: Configurar DB_HOST en localhost, ajustar DB_PASSWORD local, establecer DB_SSL=false y agregar tu variable CLOUDINARY_URL.

Base de Datos: Asegurar que el cotejamiento sea utf8mb4 para soportar tildes y caracteres en espanol.

Almacenamiento de Imagenes: Verificar la instalacion de las dependencias cloudinary y multer-storage-cloudinary para la subida en la nube, y conservar backend/frontend/uploads para las imagenes base del proyecto.