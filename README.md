# RecipeHub — Programación IV

Plataforma colaborativa de recetas de cocina.  
Stack: Node.js + Express | React + Vite | MongoDB | Docker

---

## Requisitos

- Docker Desktop instalado y corriendo
- Git

---

## Levantar el proyecto con Docker

### 1. Clonar el repositorio
```bash
git clone <URL-del-repo>
cd RecipeHub_Programacion-IV
```

### 2. Crear el archivo `.env` en la raíz
```env
MONGO_USER=admin
MONGO_PASS=clave_segura_123
MONGO_URI=mongodb://admin:clave_segura_123@mongo:27017/recipehub?authSource=admin
JWT_SECRET=un_string_largo_y_aleatorio
```

### 3. Levantar los contenedores
```bash
docker compose up --build
```

### 4. Verificar que funciona
--- 
GET http://localhost:4000/api/health
→ { "status": "ok", "timestamp": "..." }

## Variables de entorno

| Variable   | Descripción                          |
|------------|--------------------------------------|
| MONGO_USER | Usuario administrador de MongoDB     |
| MONGO_PASS | Contraseña de MongoDB                |
| MONGO_URI  | Cadena de conexión completa a MongoDB|
| JWT_SECRET | Secreto para firmar los tokens JWT   |

> ⚠️ El archivo `.env` nunca se sube al repositorio.

---

## Comandos útiles

```bash
docker compose up -d          # levantar en segundo plano
docker compose logs -f api    # ver logs del backend
docker compose down           # apagar contenedores
```

---

## Estructura del proyecto

```
RecipeHub_Programacion-IV/
├── backend/          # API REST (Node.js + Express)
├── frontend/         # SPA (React + Vite)
├── docker-compose.yml
├── .env              # (no se sube a GitHub)
└── README.md
```