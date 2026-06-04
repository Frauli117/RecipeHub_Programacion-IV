const mongoose = require('mongoose');

const comentarioSchema = new mongoose.Schema({
  recetaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Receta',
    required: true,
    index: true,
  },
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
    index: true,
  },
  texto: {
    type: String,
    required: true,
    trim: true,
  },
  calificacion: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: 'La calificacion debe ser un entero',
    },
  },
}, { timestamps: { createdAt: true, updatedAt: false } });

module.exports = mongoose.model('Comentario', comentarioSchema);
