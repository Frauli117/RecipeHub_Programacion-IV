const mongoose = require('mongoose');
const Receta = require('../models/Receta');
const Comentario = require('../models/Comentario');

const DIFICULTADES = ['Fácil', 'Media', 'Difícil'];
const CAMPOS_AUTOR = 'nombre email bio avatarUrl';

function esObjectIdValido(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function textoLimpio(valor) {
  return typeof valor === 'string' ? valor.trim() : valor;
}

function validarReceta(datos) {
  const camposTexto = ['titulo', 'descripcion', 'categoria', 'dificultad'];

  for (const campo of camposTexto) {
    if (!textoLimpio(datos[campo])) {
      return { error: `El campo ${campo} es obligatorio` };
    }
  }

  if (!DIFICULTADES.includes(datos.dificultad)) {
    return { error: 'La dificultad debe ser Fácil, Media o Difícil' };
  }

  const tiempoMin = Number(datos.tiempoMin);
  if (!Number.isFinite(tiempoMin) || tiempoMin <= 0) {
    return { error: 'El tiempoMin debe ser un numero mayor a 0' };
  }

  const porciones = Number(datos.porciones);
  if (!Number.isInteger(porciones) || porciones <= 0) {
    return { error: 'Las porciones deben ser un entero mayor a 0' };
  }

  if (!Array.isArray(datos.ingredientes) || datos.ingredientes.length === 0) {
    return { error: 'Los ingredientes deben ser un arreglo no vacio' };
  }

  const ingredientes = [];
  for (const ingrediente of datos.ingredientes) {
    const nombre = textoLimpio(ingrediente?.nombre);
    const unidad = textoLimpio(ingrediente?.unidad);
    const cantidad = Number(ingrediente?.cantidad);

    if (!nombre || !unidad || !Number.isFinite(cantidad) || cantidad <= 0) {
      return { error: 'Cada ingrediente requiere nombre, cantidad mayor a 0 y unidad' };
    }

    ingredientes.push({ nombre, cantidad, unidad });
  }

  if (!Array.isArray(datos.pasos) || datos.pasos.length === 0) {
    return { error: 'Los pasos deben ser un arreglo no vacio' };
  }

  const pasos = datos.pasos.map(textoLimpio);
  if (pasos.some((paso) => !paso)) {
    return { error: 'Cada paso debe ser un texto no vacio' };
  }

  if (datos.tags !== undefined && !Array.isArray(datos.tags)) {
    return { error: 'Los tags deben ser un arreglo de textos' };
  }

  const tags = (datos.tags || [])
    .map(textoLimpio)
    .filter(Boolean);

  return {
    value: {
      titulo: textoLimpio(datos.titulo),
      descripcion: textoLimpio(datos.descripcion),
      categoria: textoLimpio(datos.categoria),
      tiempoMin,
      porciones,
      dificultad: datos.dificultad,
      ingredientes,
      pasos,
      tags,
      imagenUrl: textoLimpio(datos.imagenUrl) || undefined,
    },
  };
}

async function agregarCalificacionPromedio(recetas) {
  if (recetas.length === 0) {
    return [];
  }

  const ids = recetas.map((receta) => receta._id);
  const promedios = await Comentario.aggregate([
    { $match: { recetaId: { $in: ids } } },
    { $group: { _id: '$recetaId', promedio: { $avg: '$calificacion' } } },
  ]);

  const mapaPromedios = new Map(
    promedios.map((item) => [item._id.toString(), Math.round(item.promedio * 10) / 10]),
  );

  return recetas.map((receta) => ({
    ...receta,
    calificacionPromedio: mapaPromedios.get(receta._id.toString()) || 0,
  }));
}

async function listarRecetas(req, res) {
  try {
    const filtros = {};
    const { categoria, dificultad, tags, autorId } = req.query;

    if (categoria) {
      filtros.categoria = categoria;
    }

    if (dificultad) {
      if (!DIFICULTADES.includes(dificultad)) {
        return res.status(400).json({ error: 'La dificultad debe ser Fácil, Media o Difícil' });
      }
      filtros.dificultad = dificultad;
    }

    if (autorId) {
      if (!esObjectIdValido(autorId)) {
        return res.status(400).json({ error: 'autorId invalido' });
      }
      filtros.autorId = autorId;
    }

    if (tags) {
      const tagsFiltro = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      if (tagsFiltro.length > 0) {
        filtros.tags = { $in: tagsFiltro };
      }
    }

    const recetas = await Receta.find(filtros).sort({ createdAt: -1 }).lean();
    const recetasConPromedio = await agregarCalificacionPromedio(recetas);

    res.json(recetasConPromedio);
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
}

async function crearReceta(req, res) {
  try {
    const resultado = validarReceta(req.body);
    if (resultado.error) {
      return res.status(400).json({ error: resultado.error });
    }

    const receta = await Receta.create({
      ...resultado.value,
      autorId: req.user.id,
    });

    res.status(201).json({
      ...receta.toObject(),
      calificacionPromedio: 0,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
}

async function obtenerReceta(req, res) {
  try {
    const { id } = req.params;
    if (!esObjectIdValido(id)) {
      return res.status(400).json({ error: 'Id de receta invalido' });
    }

    const receta = await Receta.findById(id).populate('autorId', CAMPOS_AUTOR).lean();
    if (!receta) {
      return res.status(404).json({ error: 'Receta no encontrada' });
    }

    const [recetaConPromedio] = await agregarCalificacionPromedio([receta]);
    res.json(recetaConPromedio);
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
}

async function actualizarReceta(req, res) {
  try {
    const { id } = req.params;
    if (!esObjectIdValido(id)) {
      return res.status(400).json({ error: 'Id de receta invalido' });
    }

    const resultado = validarReceta(req.body);
    if (resultado.error) {
      return res.status(400).json({ error: resultado.error });
    }

    const receta = await Receta.findById(id);
    if (!receta) {
      return res.status(404).json({ error: 'Receta no encontrada' });
    }

    if (receta.autorId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para editar esta receta' });
    }

    Object.assign(receta, resultado.value);
    await receta.save();

    const recetaActualizada = await Receta.findById(id).populate('autorId', CAMPOS_AUTOR).lean();
    const [recetaConPromedio] = await agregarCalificacionPromedio([recetaActualizada]);

    res.json(recetaConPromedio);
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
}

async function eliminarReceta(req, res) {
  try {
    const { id } = req.params;
    if (!esObjectIdValido(id)) {
      return res.status(400).json({ error: 'Id de receta invalido' });
    }

    const receta = await Receta.findById(id);
    if (!receta) {
      return res.status(404).json({ error: 'Receta no encontrada' });
    }

    if (receta.autorId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para borrar esta receta' });
    }

    await Comentario.deleteMany({ recetaId: receta._id });
    await receta.deleteOne();

    res.json({ message: 'Receta eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
}

module.exports = {
  listarRecetas,
  crearReceta,
  obtenerReceta,
  actualizarReceta,
  eliminarReceta,
};
