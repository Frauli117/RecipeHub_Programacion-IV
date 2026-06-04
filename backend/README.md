== Backend base listo ==

Cómo correrlo:
1. Tener Docker Desktop abierto.
2. Levantar Mongo:  docker start recipehub-mongo
   (si nunca lo crearon: docker run -d --name recipehub-mongo -p 27017:27017 -v recipehub_mongo_data:/data/db mongo:7)
3. Crear un archivo .env en /backend con:
     PORT=4000
     MONGO_URI=mongodb://localhost:27017/recipehub
     JWT_SECRET=<un texto largo>
4. npm install  y luego  npm run dev

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

Lo que te toca a ti (Integrante 2):
  - Modelo Comentario (recetaId ref, usuarioId ref, texto, calificacion 1..5, createdAt)
  - CRUD de recetas (usar 'auth' en crear/editar/borrar; validar que sea el autor)
  - Al listar/ver recetas, agregar el campo calculado calificacionPromedio
  - CRUD de comentarios
  - GET /api/health final + validaciones + status codes
  - 3 pruebas (que NO necesiten Mongo, como la de /api/health)
  - Documentar la forma exacta de cada respuesta para el Integrante 3