== Backend API listo ==

Cómo correrlo:
1. Tener Docker Desktop abierto.
2. Levantar Mongo:  docker start recipehub-mongo
   (si nunca lo crearon: docker run -d --name recipehub-mongo -p 27017:27017 -v recipehub_mongo_data:/data/db mongo:7)
3. Crear un archivo .env en /backend con:
     PORT=4000
     MONGO_URI=mongodb://localhost:27017/recipehub
     JWT_SECRET=<un texto largo>
4. npm install  y luego  npm run dev
5. Para correr pruebas: npm test

Estructura:
  src/config/db.js -> conexión a Mongo
  src/models/Usuario.js -> modelo de usuario
  src/models/Receta.js  -> modelo de receta 
  src/middleware/auth.js -> verifica el JWT. Para proteger una ruta: router.post('/ruta', auth, miFuncion)
  src/controllers/ -> aquí va la lógica (sigue el patrón de authController.js)
  src/routes/  -> aquí se montan las URLs (sigue el patrón de auth.js)
  src/app.js -> registra las rutas

Endpoints que ya funcionan:
  POST /api/auth/register -> body {nombre, email, password}  -> 201, devuelve {_id, nombre, email}
  POST /api/auth/login -> body {email, password}          -> {token, usuario}
  GET  /api/auth/me -> requiere header Authorization: Bearer <token>
  GET  /api/recetas -> lista recetas con filtros opcionales categoria, dificultad, tags
  POST /api/recetas -> crea receta, requiere Authorization: Bearer <token>
  GET  /api/recetas/:id -> detalle con autor populado y calificacionPromedio
  PUT  /api/recetas/:id -> edita receta, requiere token y ser autor
  DELETE /api/recetas/:id -> borra receta y comentarios asociados, requiere token y ser autor
  GET  /api/recetas/:id/comentarios -> lista comentarios con usuario populado
  POST /api/recetas/:id/comentarios -> crea comentario, requiere token
  DELETE /api/comentarios/:id -> borra comentario, requiere token y ser autor
  GET  /api/health -> {status, timestamp}

Entrega para el Integrante 3:
  - El contrato exacto de respuestas esta en API_RESPUESTAS.md.
  - La calificacionPromedio ya viene calculada en GET /api/recetas y GET /api/recetas/:id.
  - Las pruebas obligatorias no necesitan MongoDB y se corren con npm test.
