const express = require('express');
const auth = require('../middleware/auth');
const { eliminarComentario } = require('../controllers/comentarioController');

const router = express.Router();

router.delete('/:id', auth, eliminarComentario);

module.exports = router;
