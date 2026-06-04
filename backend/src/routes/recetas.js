const express = require('express');
const auth = require('../middleware/auth');
const {
  listarRecetas,
  crearReceta,
  obtenerReceta,
  actualizarReceta,
  eliminarReceta,
} = require('../controllers/recetaController');
const {
  listarComentarios,
  crearComentario,
} = require('../controllers/comentarioController');

const router = express.Router();

router.get('/', listarRecetas);
router.post('/', auth, crearReceta);
router.get('/:id', obtenerReceta);
router.put('/:id', auth, actualizarReceta);
router.delete('/:id', auth, eliminarReceta);
router.get('/:id/comentarios', listarComentarios);
router.post('/:id/comentarios', auth, crearComentario);

module.exports = router;
