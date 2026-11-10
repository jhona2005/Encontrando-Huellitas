Encontrando Huellitas - Guia de Instalacion Local

Este repositorio contiene la aplicacion Encontrando Huellitas, un sistema web desarrollado con Node.js, Express y MySQL para el reporte, busqueda y coincidencia de mascotas perdidas y encontradas.

Sigue esta guia paso a paso para clonar, configurar y ejecutar el proyecto en tu entorno local.

Requisitos Previos

Antes de comenzar, asegurate de tener instalado lo siguiente en tu equipo:

Node.js (version 18 o superior)

Git

MySQL Server (local mediante MySQL Workbench, XAMPP/WAMP o un servidor MySQL nativo)

Pasos para Ejecutar el Proyecto en Local

1. Clonar el Repositorio

Abre tu terminal o consola de comandos e ingresa:

git clone https://github.com/jhona2005/Encontrando-Huellitas.git
cd Encontrando-Huellitas/backend


2. Instalar Dependencias del Backend

Dentro de la carpeta backend, ejecuta el siguiente comando para descargar las librerias necesarias (express, mysql2, dotenv, cors, multer):

npm install


3. Configurar la Base de Datos MySQL

Abre tu gestor de base de datos (MySQL Workbench, phpMyAdmin o terminal de MySQL).

Crea la base de datos vacia ejecutando:

CREATE DATABASE huellitas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE huellitas;


Ejecuta el archivo del esquema de la base de datos ubicado en la carpeta database/schema.sql para crear las tablas, procedimientos y activadores.

(Opcional) Carga los datos de prueba iniciales ejecutando el archivo database/seed.sql.

4. Configurar las Variables de Entorno (.env)

Dentro de la carpeta backend/, crea un archivo llamado .env (al mismo nivel que server.js) con las credenciales de tu base de datos local:

PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contrasena_local
DB_NAME=huellitas
DB_PORT=3306
DB_SSL=false


Nota: Reemplaza tu_contrasena_local por la clave de tu usuario root de MySQL local. Si tu usuario no tiene contrasena, dejalo en blanco (DB_PASSWORD=).

5. Verificar y Ajustar las Rutas de Estaticos en server.js

Asegurate de que en el archivo backend/server.js la constante del frontend apunte a la carpeta local correctamente:

const frontendPath = path.resolve(__dirname, 'frontend');
app.use(express.static(frontendPath, { index: 'index.html' }));
app.use('/uploads', express.static(path.join(frontendPath, 'uploads')));


6. Iniciar el Servidor

Desde la terminal, ubicado en la carpeta backend/, ejecuta:

npm run dev


o si prefieres usar Node directamente:

npm start


7. Abrir la Aplicacion

Abre tu navegador web e ingresa a la siguiente direccion:

http://localhost:3000

Ya tienes el sistema Encontrando Huellitas completamente funcional en tu equipo.

Resumen de Modificaciones Necesarias para Entorno Local

backend/.env: Cambiar DB_HOST a localhost, ajustar DB_PASSWORD local y establecer DB_SSL=false.

Base de Datos: Asegurar que el cotejamiento sea utf8mb4 para soportar tildes y caracteres en espanol.

Carpeta uploads: Asegurarse de que exista la carpeta backend/frontend/uploads para almacenar las imagenes subidas por los usuarios.