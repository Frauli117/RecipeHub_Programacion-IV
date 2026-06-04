const mongoose = require('mongoose');
const Comentario = require('../models/Comentario');
const Receta = require('../models/Receta');

const CAMPOS_USUARIO = 'nombre avatarUrl';

function esObjectIdValido(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function validarComentario(datos) {
  const texto = typeof datos.texto === 'string' ? datos.texto.trim() : '';
  if (!texto) {
    return { error: 'El texto del comentario es obligatorio' };
  }

  const calificacion = Number(datos.calificacion);
  if (!Number.isInteger(calificacion) || calificacion < 1 || calificacion > 5) {
    return { error: 'La calificacion debe ser un entero de 1 a 5' };
  }

  return { value: { texto, calificacion } };
}

async function listarComentarios(req, res) {
  try {
    const { id } = req.params;
    if (!esObjectIdValido(id)) {
      return res.status(400).json({ error: 'Id de receta invalido' });
    }

    const recetaExiste = await Receta.exists({ _id: id });
    if (!recetaExiste) {
      return res.status(404).json({ error: 'Receta no encontrada' });
    }

    const comentarios = await Comentario.find({ recetaId: id })
      .populate('usuarioId', CAMPOS_USUARIO)
      .sort({ createdAt: -1 })
      .lean();

    res.json(comentarios);
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
}

async function crearComentario(req, res) {
  try {
    const { id } = req.params;
    if (!esObjectIdValido(id)) {
      return res.status(400).json({ error: 'Id de receta invalido' });
    }

    const resultado = validarComentario(req.body);
    if (resultado.error) {
      return res.status(400).json({ error: resultado.error });
    }

    const recetaExiste = await Receta.exists({ _id: id });
    if (!recetaExiste) {
      return res.status(404).json({ error: 'Receta no encontrada' });
    }

    const comentario = await Comentario.create({
      recetaId: id,
      usuarioId: req.user.id,
      ...resultado.value,
    });

    const comentarioCreado = await Comentario.findById(comentario._id)
      .populate('usuarioId', CAMPOS_USUARIO)
      .lean();

    res.status(201).json(comentarioCreado);
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
}

async function eliminarComentario(req, res) {
  try {
    const { id } = req.params;
    if (!esObjectIdValido(id)) {
      return res.status(400).json({ error: 'Id de comentario invalido' });
    }

    const comentario = await Comentario.findById(id);
    if (!comentario) {
      return res.status(404).json({ error: 'Comentario no encontrado' });
    }

    if (comentario.usuarioId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para borrar este comentario' });
    }

    await comentario.deleteOne();
    res.json({ message: 'Comentario eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
}

module.exports = {
  listarComentarios,
  crearComentario,
  eliminarComentario,
};
