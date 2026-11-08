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

/* Servir archivos estaticos e imagenes */
app.use('/uploads', express.static(path.join(__dirname, '../frontend/uploads')));
app.use(express.static(path.join(__dirname, '../frontend')));

/* Importacion de rutas */
const authRoutes = require('./routes/authRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const coincidenciaRoutes = require('./routes/coincidenciaRoutes');
const entidadRoutes = require('./routes/entidadRoutes');
const mensajeRoutes = require('./routes/mensajeRoutes');

/* Vinculacion de endpoints API REST */
app.use('/api/auth', authRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/coincidencias', coincidenciaRoutes);
app.use('/api/entidades', entidadRoutes);
app.use('/api/mensajes', mensajeRoutes);

/* Ruta de verificacion */
app.get('/api/health', (req, res) => {
    res.json({ estado: 'Servidor funcional', timestamp: new Date() });
});

/* Inicializacion */
app.listen(PORT, () => {
    console.log(`Servidor ejecutandose en el puerto ${PORT}`);
});