const mongoose = require('mongoose');

const ingredienteSchema = new mongoose.Schema({
  nombre:   { type: String, required: true },
  cantidad: { type: Number, required: true },
  unidad:   { type: String, required: true },
}, { _id: false });

const recetaSchema = new mongoose.Schema({
  titulo:       { type: String, required: true },
  descripcion:  { type: String, required: true },
  categoria:    { type: String, required: true },
  tiempoMin:    { type: Number, required: true },
  porciones:    { type: Number, required: true },
  dificultad:   { type: String, required: true, enum: ['Fácil', 'Media', 'Difícil'] },
  ingredientes: { type: [ingredienteSchema], required: true },
  pasos:        { type: [String], required: true },
  tags:         { type: [String], default: [] },
  autorId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true }, 
  imagenUrl:    { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Receta', recetaSchema);