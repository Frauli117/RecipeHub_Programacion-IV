# RecipeHub — Frontend

Interfaz web para la aplicación de recetas RecipeHub. Permite registrarse, iniciar sesión, explorar recetas con filtros, ver el detalle completo de cada una, publicar comentarios con calificación y gestionar las propias recetas (crear, editar, eliminar).

## Stack

- **React 18** con Vite
- **React Router v6** para el enrutamiento
- **Sonner** para notificaciones toast
- CSS vanilla (sin frameworks de utilidad)

---

## Instalación y configuración

### Requisito previo

El backend debe estar corriendo antes de levantar el frontend. Seguí los pasos del README del backend para instalarlo y ejecutarlo.

### Pasos

```bash
# 1. Clonar el repositorio e instalar dependencias
npm install

# 2. Crear el archivo de variables de entorno
# Creá un archivo .env en la raíz del proyecto con el siguiente contenido:
VITE_API_URL=http://localhost:4000

# 3. Levantar el servidor de desarrollo
npm run dev
```

> El valor de `VITE_API_URL` debe apuntar al puerto donde corre el backend. El puerto por defecto es `4000`.

---

## Estructura del proyecto

```
src/
├── api/
│   ├── axios.js              # Instancia de Axios con baseURL y token automático
│   └── tokenStorage.js       # Utilidades para guardar/leer/eliminar el JWT en localStorage
│
├── components/
│   └── Navbar.jsx/css        # Barra de navegación presente en todas las rutas protegidas
│
├── context/
│   ├── modal-receta.context.js   # createContext del modal de recetas
│   ├── useModalReceta.js         # Hook para consumir el contexto del modal
│   └── ModalRecetaProvider.jsx   # Estado y lógica del modal (abrir en modo crear/editar, cerrar)
│
├── modules/
│   ├── auth/
│   │   ├── api/authApi.js        # Llamadas a /api/auth (login, register, me)
│   │   └── context/
│   │       ├── auth.context.js   # createContext de autenticación
│   │       ├── useAuth.js        # Hook para consumir el contexto de auth
│   │       └── AuthProvider.jsx  # Estado global de sesión (usuario, login, logout, register)
│   │
│   └── receta/
│       ├── api/
│       │   ├── recetaApi.js      # CRUD de recetas (listar, obtener, crear, actualizar, eliminar)
│       │   └── comentarioApi.js  # Operaciones de comentarios (listar, crear, eliminar)
│       ├── components/
│       │   ├── ListaRecetas      # Página home: grilla de recetas con filtros por categoría y dificultad
│       │   └── FormReceta        # Modal reutilizable para crear y editar recetas
│       └── pages/
│           └── DetalleReceta     # Vista completa de una receta con comentarios
│
├── pages/
│   ├── PaginaDeLogin.jsx         # Formulario de inicio de sesión
│   ├── PaginaDeRegistro.jsx      # Formulario de registro
│   └── PaginaPerfil.jsx/css      # Perfil del usuario con sus recetas publicadas
│
└── routes/
    ├── AppRoutes.jsx             # Definición central de todas las rutas
    ├── RootRedirect.jsx          # Redirige / → /home o /login según el estado de sesión
    ├── RutaPublica.jsx           # Redirige a /home si ya hay sesión activa
    └── RutaProtegida.jsx         # Requiere sesión; monta Navbar, layout y el modal de recetas
```

---

## Módulos principales

### Autenticación

`AuthProvider` envuelve toda la aplicación desde `main.jsx`. Al iniciar, intenta restaurar la sesión guardada llamando a `GET /api/auth/me` con el token almacenado en `localStorage`. El estado `cargando` evita que la app renderice rutas antes de conocer si hay sesión activa.

El token se adjunta automáticamente a cada petición mediante un interceptor en `axios.js`, por lo que las llamadas a endpoints protegidos no requieren manejo manual del header `Authorization`.

Métodos disponibles a través de `useAuth()`:

| Método / propiedad | Descripción |
|---|---|
| `usuario` | Objeto con `_id`, `nombre`, `email` del usuario logueado, o `null` |
| `isAuthenticated` | Booleano derivado de `usuario` |
| `cargando` | `true` mientras se verifica la sesión al inicio |
| `login(email, password)` | Inicia sesión y guarda el token |
| `register(nombre, email, password)` | Registra un nuevo usuario |
| `logout()` | Elimina el token y limpia el estado |

### Recetas

El módulo de recetas vive en `src/modules/receta/`. Las funciones de `recetaApi.js` y `comentarioApi.js` cubren todos los endpoints disponibles. `ListaRecetas` usa filtros reactivos: cada cambio de filtro dispara una nueva llamada al backend con los parámetros correspondientes.

### Modal de recetas (FormReceta)

`FormReceta` es un único componente modal que sirve tanto para crear como para editar una receta. Se monta una sola vez dentro de `RutaProtegida`, por lo que está disponible en cualquier pantalla protegida sin necesidad de importarlo localmente.

Se controla a través de `useModalReceta()`:

```js
const { abrirCrear, abrirEditar, cerrar } = useModalReceta();

// Abrir para crear una nueva receta
abrirCrear();

// Abrir para editar una receta existente
// El segundo argumento es un callback opcional que se ejecuta tras guardar
abrirEditar(recetaId, () => recargarDatos());
```

El Navbar llama a `abrirCrear()` desde el menú desplegable "Recetas". La página de detalle llama a `abrirEditar()` desde la sidebar, visible solo para el autor de la receta.

---

## Rutas

| Ruta | Componente | Acceso |
|---|---|---|
| `/` | `RootRedirect` | Público — redirige según sesión |
| `/login` | `PaginaDeLogin` | Solo sin sesión |
| `/register` | `PaginaDeRegistro` | Solo sin sesión |
| `/home` | `ListaRecetas` | Requiere sesión |
| `/recetas/:id` | `DetalleReceta` | Requiere sesión |
| `/perfil` | `PaginaPerfil` | Requiere sesión |

Las rutas públicas redirigen a `/home` si ya hay una sesión activa. Las rutas protegidas redirigen a `/login` si no la hay.