# RecipeHub — Programación IV

Plataforma colaborativa de recetas de cocina. Los usuarios pueden publicar,
explorar, calificar y comentar recetas.

**Stack:** Node.js + Express · React + Vite · MongoDB 7 · Docker Compose · Nginx · GitHub Actions

| Servicio | URL en producción |
|----------|-------------------|
| Frontend (SPA React) | https://app.recipehubb.xyz |
| API REST (Express)   | https://api.recipehubb.xyz/api/health |

---

## Arquitectura

![image alt](https://github.com/Frauli117/RecipeHub_Programacion-IV/blob/49e75a603e8d2a6c8b002142d998e86753c206f8/ArquitecturaP4.drawio.png)

```

- El **frontend** es un build estático (`dist/`) servido directamente por Nginx. No hay servidor Node para el frontend.
- El **backend** corre en un contenedor Docker; Nginx redirige `/api/*` al puerto interno 4000.
- **MongoDB** vive en la red interna de Docker, **sin puerto expuesto al host**. Los datos persisten en el volumen nombrado `mongo_data`.

Diagrama y descripción detallada en [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md).

---

## Variables de entorno

Se cargan desde un archivo `.env` en la raíz (nunca se versiona; ver [`.env.example`](.env.example)).
En producción, los valores sensibles provienen de los **Secrets de GitHub**.

| Variable     | Descripción                                                        | Ejemplo |
|--------------|--------------------------------------------------------------------|---------|
| `MONGO_USER` | Usuario root de MongoDB (lo crea el contenedor `mongo`).           | `admin` |
| `MONGO_PASS` | Contraseña root de MongoDB.                                        | `••••••` |
| `MONGO_URI`  | Cadena de conexión que usa la API para conectarse a Mongo.        | `mongodb://admin:PASS@mongo:27017/recipehub?authSource=admin` |
| `JWT_SECRET` | Secreto para firmar y verificar los tokens JWT.                   | string largo y aleatorio |
| `PORT`       | Puerto interno de la API (opcional, por defecto `4000`).          | `4000` |

> El `host` en `MONGO_URI` debe ser `mongo` (el nombre del servicio en `docker-compose.yml`), no `localhost`.

---

## Ejecutar en local (desarrollo)

**Requisitos:** Docker Engine + Docker Compose v2, Git.

```bash
git clone <URL-del-repo>
cd RecipeHub_Programacion-IV

# 1. Crear el .env a partir de la plantilla y editar los valores
cp .env.example .env

# 2. Levantar API + MongoDB
docker compose up --build
```

Verificar:
```bash
curl http://localhost:4000/api/health
# → { "status": "ok", "timestamp": "..." }
```

Frontend en local (apuntando a la API local):
```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:4000" > .env.local
npm run dev          # http://localhost:5173
```

Pruebas del backend:
```bash
cd backend
npm install
npm test             # 3 pruebas unitarias
```

---

## Despliegue en producción (VPS, desde cero)

Guía completa para reproducir el despliegue en un **VPS Ubuntu 24.04** limpio.

### 1. Dominio y DNS

Crear dos registros **A** apuntando a la IP pública del VPS:

| Tipo | Nombre | Valor |
|------|--------|-------|
| A | `api` | `<IP_DEL_VPS>` |
| A | `app` | `<IP_DEL_VPS>` |

Esperar a que propaguen (`dig api.recipehubb.xyz +short` debe devolver la IP).

### 2. Acceso y firewall

```bash
ssh ubuntu@<IP_DEL_VPS>            # acceso por llave SSH, no contraseña
sudo ufw allow 22 && sudo ufw allow 80 && sudo ufw allow 443
sudo ufw enable
```

### 3. Instalar software

```bash
# Docker Engine + Compose plugin
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER          # reconectar la sesión tras esto

# Nginx, Certbot y Git
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx git
```

> El job de deploy compila el frontend en el VPS, por lo que también se requiere Node 20:
> ```bash
> curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
> sudo apt install -y nodejs
> ```

### 4. Clonar el proyecto y crear el `.env`

```bash
cd /home/ubuntu
git clone <URL-del-repo> recipehub
cd recipehub
cp .env.example .env
nano .env                              # poner credenciales reales
```

### 5. Levantar los contenedores

```bash
docker compose up -d --build
docker compose ps                      # api y mongo deben estar "running"
curl http://localhost:4000/api/health  # → 200 ok
```

### 6. Compilar el frontend

```bash
cd frontend
npm install
VITE_API_URL=https://api.recipehubb.xyz npm run build   # genera frontend/dist
```

### 7. Configurar Nginx

Copiar la configuración de referencia incluida en el repo:

```bash
sudo cp /home/ubuntu/recipehub/nginx/recipehub.conf /etc/nginx/sites-available/recipehub
sudo ln -s /etc/nginx/sites-available/recipehub /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

### 8. Emitir el certificado SSL (Let's Encrypt)

```bash
sudo certbot --nginx -d api.recipehubb.xyz -d app.recipehubb.xyz
sudo certbot renew --dry-run           # verifica la renovación automática
```

Certbot agrega los bloques `:443` con SSL y la redirección 301 automáticamente.

### 9. Verificación final

```bash
curl -I https://api.recipehubb.xyz/api/health   # 200
curl -I http://api.recipehubb.xyz/api/health    # 301 → https
curl -I https://app.recipehubb.xyz              # 200, candado verde en el navegador
```

---

## CI/CD — GitHub Actions

El workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) se ejecuta en cada `push` a la rama `master`:

1. **build-and-test** — `npm install` + `npm test` (3 pruebas) en `backend/`.
2. **deploy** — entra por SSH al VPS, hace `git pull`, `docker compose up -d --build`, recompila el frontend y verifica `curl https://api.recipehubb.xyz/api/health`.

### Secrets requeridos (Settings → Secrets and variables → Actions)

| Secret | Descripción |
|--------|-------------|
| `VPS_HOST` | IP pública del VPS |
| `VPS_USER` | Usuario SSH (`ubuntu`) |
| `VPS_SSH_KEY` | Llave privada SSH en formato PEM |
| `MONGO_URI` | Cadena de conexión a MongoDB |
| `JWT_SECRET` | Secreto de firma de los JWT |

> Ningún secreto aparece en el código ni en los logs. El `.env` está en `.gitignore`.

---

## Estructura del proyecto

```
RecipeHub_Programacion-IV/
├── backend/                 # API REST (Express + Mongoose)
│   ├── src/                 # app, rutas, controllers, models, middleware
│   ├── tests/               # pruebas con Jest + Supertest
│   └── Dockerfile
├── frontend/                # SPA (React + Vite)
│   └── src/                 # pages, modules, routes, api
├── nginx/recipehub.conf     # configuración de referencia de Nginx
├── docs/ARQUITECTURA.md     # documento de arquitectura
├── docker-compose.yml       # servicios api + mongo
├── .github/workflows/       # pipeline de CI/CD
├── .env.example             # plantilla de variables (el .env real no se sube)
└── README.md
```

---

## Endpoints principales

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Registrar usuario |
| POST | `/api/auth/login` | — | Login, retorna JWT |
| GET  | `/api/auth/me` | JWT | Perfil del usuario autenticado |
| GET  | `/api/recetas` | — | Listar recetas (filtros: `categoria`, `dificultad`, `tags`) |
| POST | `/api/recetas` | JWT | Crear receta |
| GET  | `/api/recetas/:id` | — | Detalle de receta (incluye autor) |
| PUT  | `/api/recetas/:id` | JWT (autor) | Actualizar receta |
| DELETE | `/api/recetas/:id` | JWT (autor) | Eliminar receta |
| GET  | `/api/recetas/:id/comentarios` | — | Comentarios de una receta |
| POST | `/api/recetas/:id/comentarios` | JWT | Comentar receta |
| DELETE | `/api/comentarios/:id` | JWT (autor) | Eliminar comentario |
| GET  | `/api/health` | — | Health check |
