const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const recetaRoutes = require('./routes/recetas');
const comentarioRoutes = require('./routes/comentarios');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/recetas', recetaRoutes);
app.use('/api/comentarios', comentarioRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

module.exports = app;
