require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

/* Middlewares globales */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Servir archivos estáticos del frontend */
const frontendPath = path.resolve(__dirname, 'frontend');
app.use(express.static(frontendPath, { index: 'index.html' }));
app.use('/uploads', express.static(path.join(frontendPath, 'uploads')));

/* Importación de rutas API */
const authRoutes = require('./routes/authRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const coincidenciaRoutes = require('./routes/coincidenciaRoutes');
const entidadRoutes = require('./routes/entidadRoutes');
const mensajeRoutes = require('./routes/mensajeRoutes');

/* Vinculación de endpoints API REST */
app.use('/api/auth', authRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/coincidencias', coincidenciaRoutes);
app.use('/api/entidades', entidadRoutes);
app.use('/api/mensajes', mensajeRoutes);

/* Ruta de verificación API */
app.get('/api/health', (req, res) => {
    res.json({ estado: 'Servidor funcional', timestamp: new Date() });
});

/* Servir la interfaz gráfica para cualquier ruta no capturada por la API */
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
        if (err) {
            res.status(404).send('No se pudo encontrar index.html en la carpeta frontend.');
        }
    });
});

/* Inicialización del servidor */
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});