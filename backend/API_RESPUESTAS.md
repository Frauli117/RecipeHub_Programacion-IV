# Contrato de respuestas para el Integrante 3

La API usa respuestas directas. Cuando hay error, siempre devuelve:

```json
{ "error": "Mensaje del error" }
```

## Auth existente

### POST /api/auth/register

Body:

```json
{
  "nombre": "Ana Mora",
  "email": "ana@example.com",
  "password": "123456"
}
```

Respuesta 201:

```json
{
  "_id": "665f1b2c3d4e5f6789012345",
  "nombre": "Ana Mora",
  "email": "ana@example.com"
}
```

### POST /api/auth/login

Respuesta 200:

```json
{
  "token": "jwt.aqui",
  "usuario": {
    "_id": "665f1b2c3d4e5f6789012345",
    "nombre": "Ana Mora",
    "email": "ana@example.com"
  }
}
```

## Recetas

### Body para crear o editar receta

`POST /api/recetas` y `PUT /api/recetas/:id` requieren JWT.

```json
{
  "titulo": "Panqueques de avena",
  "descripcion": "Panqueques faciles para desayuno",
  "categoria": "Desayuno",
  "tiempoMin": 20,
  "porciones": 2,
  "dificultad": "Fácil",
  "ingredientes": [
    { "nombre": "Avena", "cantidad": 1, "unidad": "taza" },
    { "nombre": "Banano", "cantidad": 1, "unidad": "unidad" }
  ],
  "pasos": [
    "Licuar todos los ingredientes.",
    "Cocinar porciones pequenas en un sarten."
  ],
  "tags": ["rapido", "desayuno"],
  "imagenUrl": "https://example.com/panqueques.jpg"
}
```

Campos obligatorios: `titulo`, `descripcion`, `categoria`, `tiempoMin`, `porciones`, `dificultad`, `ingredientes`, `pasos`.

`dificultad` solo acepta `Fácil`, `Media` o `Difícil`.

### GET /api/recetas

Filtros opcionales:

```text
/api/recetas?categoria=Desayuno&dificultad=Fácil&tags=rapido,vegano
```

Respuesta 200:

```json
[
  {
    "_id": "665f1b2c3d4e5f6789011111",
    "titulo": "Panqueques de avena",
    "descripcion": "Panqueques faciles para desayuno",
    "categoria": "Desayuno",
    "tiempoMin": 20,
    "porciones": 2,
    "dificultad": "Fácil",
    "ingredientes": [
      { "nombre": "Avena", "cantidad": 1, "unidad": "taza" }
    ],
    "pasos": ["Licuar todo.", "Cocinar."],
    "tags": ["rapido", "desayuno"],
    "autorId": "665f1b2c3d4e5f6789012345",
    "imagenUrl": "https://example.com/panqueques.jpg",
    "createdAt": "2026-06-04T22:00:00.000Z",
    "updatedAt": "2026-06-04T22:00:00.000Z",
    "calificacionPromedio": 4.5
  }
]
```

Si la receta no tiene comentarios, `calificacionPromedio` viene como `0`.

### POST /api/recetas

Respuesta 201:

```json
{
  "_id": "665f1b2c3d4e5f6789011111",
  "titulo": "Panqueques de avena",
  "descripcion": "Panqueques faciles para desayuno",
  "categoria": "Desayuno",
  "tiempoMin": 20,
  "porciones": 2,
  "dificultad": "Fácil",
  "ingredientes": [
    { "nombre": "Avena", "cantidad": 1, "unidad": "taza" }
  ],
  "pasos": ["Licuar todo.", "Cocinar."],
  "tags": ["rapido", "desayuno"],
  "autorId": "665f1b2c3d4e5f6789012345",
  "imagenUrl": "https://example.com/panqueques.jpg",
  "createdAt": "2026-06-04T22:00:00.000Z",
  "updatedAt": "2026-06-04T22:00:00.000Z",
  "calificacionPromedio": 0
}
```

### GET /api/recetas/:id

Respuesta 200. En detalle, `autorId` viene populado:

```json
{
  "_id": "665f1b2c3d4e5f6789011111",
  "titulo": "Panqueques de avena",
  "descripcion": "Panqueques faciles para desayuno",
  "categoria": "Desayuno",
  "tiempoMin": 20,
  "porciones": 2,
  "dificultad": "Fácil",
  "ingredientes": [
    { "nombre": "Avena", "cantidad": 1, "unidad": "taza" }
  ],
  "pasos": ["Licuar todo.", "Cocinar."],
  "tags": ["rapido", "desayuno"],
  "autorId": {
    "_id": "665f1b2c3d4e5f6789012345",
    "nombre": "Ana Mora",
    "email": "ana@example.com",
    "bio": "Me gusta cocinar",
    "avatarUrl": "https://example.com/avatar.jpg"
  },
  "imagenUrl": "https://example.com/panqueques.jpg",
  "createdAt": "2026-06-04T22:00:00.000Z",
  "updatedAt": "2026-06-04T22:00:00.000Z",
  "calificacionPromedio": 4.5
}
```

### PUT /api/recetas/:id

Requiere JWT y ser autor. Respuesta 200: receta actualizada con la misma forma de `GET /api/recetas/:id`.

### DELETE /api/recetas/:id

Requiere JWT y ser autor. También borra comentarios asociados.

Respuesta 200:

```json
{ "message": "Receta eliminada" }
```

## Comentarios

### Body para crear comentario

`POST /api/recetas/:id/comentarios` requiere JWT.

```json
{
  "texto": "Muy buena receta",
  "calificacion": 5
}
```

`calificacion` debe ser entero entre `1` y `5`.

### GET /api/recetas/:id/comentarios

Respuesta 200:

```json
[
  {
    "_id": "665f1b2c3d4e5f6789022222",
    "recetaId": "665f1b2c3d4e5f6789011111",
    "usuarioId": {
      "_id": "665f1b2c3d4e5f6789012345",
      "nombre": "Ana Mora",
      "avatarUrl": "https://example.com/avatar.jpg"
    },
    "texto": "Muy buena receta",
    "calificacion": 5,
    "createdAt": "2026-06-04T22:10:00.000Z"
  }
]
```

### POST /api/recetas/:id/comentarios

Respuesta 201:

```json
{
  "_id": "665f1b2c3d4e5f6789022222",
  "recetaId": "665f1b2c3d4e5f6789011111",
  "usuarioId": {
    "_id": "665f1b2c3d4e5f6789012345",
    "nombre": "Ana Mora",
    "avatarUrl": "https://example.com/avatar.jpg"
  },
  "texto": "Muy buena receta",
  "calificacion": 5,
  "createdAt": "2026-06-04T22:10:00.000Z"
}
```

### DELETE /api/comentarios/:id

Requiere JWT y ser autor del comentario.

Respuesta 200:

```json
{ "message": "Comentario eliminado" }
```

## Status codes

- `200`: operacion correcta.
- `201`: recurso creado.
- `400`: datos invalidos o id invalido.
- `401`: falta token o token invalido.
- `403`: el usuario autenticado no es autor del recurso.
- `404`: recurso o ruta no existe.
- `500`: error interno del servidor.
