# Cuestionarios SIG · Arrocera Liborio

Aplicación web (móvil y escritorio) para completar los 7 registros del Sistema Integrado de Gestión, con backend propio y datos centralizados en el servidor.

- **Frontend:** HTML/CSS/JS puro (sin build).
- **Backend:** Node 20 + Express + SQLite (`better-sqlite3`) + bcrypt + `cookie-session`.
- **Auth:** cookie httpOnly firmada; roles `admin` y `operador`.
- **Persistencia:** SQLite en un volumen persistente (`/data/sig.db`).
- **Despliegue objetivo:** Coolify sobre droplet Ubuntu en DigitalOcean, detrás de Traefik con Let's Encrypt.

---

## Formularios incluidos

| Código | Registro |
|---|---|
| R-ARL-001 | Arranque de Producciones |
| R-DAC-001 | Dosificación de Amonio |
| R-EPP-001 | Uso diario de EPP |
| R-LDD-001 | Limpieza Dispensadores de Agua |
| R-PBM-001 | Preoperativo BPM |
| R-PBP-001 | Post Operativo BPM |
| R-PLP-001 | Producción y Liberación |

## Modelo de datos

```
users         (id, usuario, nombre, password[bcrypt], rol, created_at)
submissions   (id, form_id, user_id → users.id, user_name, data[JSON], created_at)
```

Reglas de visibilidad:
- **admin** ve y puede borrar todos los registros.
- **operador** ve y puede borrar solo los suyos.

## API

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET  | `/api/health`          | —   | Healthcheck (Coolify / Traefik). |
| POST | `/api/login`           | —   | `{usuario, password}` → set cookie. |
| POST | `/api/logout`          | —   | Limpia cookie. |
| GET  | `/api/me`              | ✅  | Usuario actual. |
| GET  | `/api/submissions`     | ✅  | Listado (admin: todos; operador: los suyos). |
| POST | `/api/submissions`     | ✅  | Crear `{formId, data}`. |
| GET  | `/api/submissions/:id` | ✅  | Detalle (owner o admin). |
| DELETE | `/api/submissions/:id` | ✅ | Eliminar (owner o admin). |

Hay un rate limit simple en memoria: 10 intentos/min por IP en `/api/login`.

---

## Desarrollo local

```bash
npm install
SESSION_SECRET=devsecret npm start
# → http://localhost:3000
```

Usuarios sembrados la primera vez que arranca (contraseñas tomadas de `SEED_ADMIN_PASSWORD` / `SEED_OPERATOR_PASSWORD` si existen, si no, `sig2026` / `liborio`):

| Usuario | Rol |
|---|---|
| `admin` | admin |
| `diego`, `jose`, `vladimir`, `evelyn`, `minor` | operador |

La BD SQLite se crea en `./data/sig.db`. Bórrela si quiere re-sembrar.

---

## Subir a GitHub

```bash
cd "Cuestionarios SIG"
git init -b main
git add .
git commit -m "feat: backend con auth + SQLite, listo para Coolify"
git remote add origin https://github.com/<usuario>/cuestionarios-sig.git
git push -u origin main
```

---

## Despliegue en Coolify (DigitalOcean + Let's Encrypt)

### 1 · DNS

En el DNS de `liboriocr.com` cree un registro **A** para el subdominio (ej. `sig.liboriocr.com`) apuntando a la IP pública del droplet.

### 2 · Crear el recurso en Coolify

1. **+ New Resource → Application**.
2. **Source:** GitHub → seleccione el repo `cuestionarios-sig`, rama `main`.
3. **Build Pack:** `Dockerfile` (Coolify detecta el `Dockerfile` de la raíz). Si pregunta:
   - Dockerfile location: `/Dockerfile`
   - Base directory: `/`
   - Port: `3000`
4. **Domain:** `https://sig.liboriocr.com` (o el que haya escogido). Coolify emite el certificado Let's Encrypt automáticamente.

### 3 · Variables de entorno (pestaña Environment)

Copiadas desde `.env.example`:

```
NODE_ENV=production
PORT=3000
DATA_DIR=/data
SESSION_SECRET=<openssl rand -hex 32>
SEED_ADMIN_PASSWORD=<contraseña admin>
SEED_OPERATOR_PASSWORD=<contraseña inicial operadores>
```

> Genere el `SESSION_SECRET` con `openssl rand -hex 32` y guárdelo; si cambia, todas las sesiones activas se invalidan.

### 4 · Volumen persistente (crítico)

En **Storage / Persistent Volumes**, agregue:

| Tipo | Source | Destination |
|---|---|---|
| Volume | `sig-data` | `/data` |

Si no monta este volumen, **la BD se pierde en cada redeploy**.

### 5 · Healthcheck

Coolify toma el `HEALTHCHECK` del Dockerfile (pega `GET /api/health`). No hace falta configurar nada más.

### 6 · Deploy

Clic en **Deploy**. La primera vez tarda ~2 min (compila `better-sqlite3`). Al terminar:

- Abra `https://sig.liboriocr.com` → cargue con el usuario `admin` y la contraseña que puso en `SEED_ADMIN_PASSWORD`.
- Los operadores acceden con su usuario (`diego`, `jose`, …) y `SEED_OPERATOR_PASSWORD`.

### 7 · Cambio de contraseñas tras el primer login

Las variables `SEED_*` solo se usan cuando la tabla `users` está vacía. Para cambiar contraseñas después, entre al contenedor (Coolify → **Terminal**) y ejecute:

```bash
node -e "
const bcrypt = require('bcryptjs');
const db = require('./server/db');
const pwd = bcrypt.hashSync('NUEVA_PASSWORD', 10);
db.prepare('UPDATE users SET password = ? WHERE usuario = ?').run(pwd, 'admin');
console.log('actualizado');
"
```

### 8 · Backups

La BD vive en el volumen `sig-data` como un único archivo `sig.db`. Backup simple desde la terminal del contenedor:

```bash
cp /data/sig.db /data/sig.$(date +%F).db
```

O descargar el archivo con `docker cp` desde el host.

---

## Estructura del repositorio

```
.
├── Dockerfile              # build multi-stage (node:20-bookworm-slim)
├── .dockerignore
├── .env.example
├── package.json
├── app/                    # frontend estático
│   ├── index.html
│   ├── css/styles.css
│   └── js/
│       ├── constants.js    # responsables, áreas, productos
│       ├── forms.js        # esquema de los 7 registros
│       ├── storage.js      # cliente del API (fetch)
│       ├── render.js       # render dinámico por sección
│       └── app.js          # router login → selección → forma
└── server/                 # backend
    ├── index.js            # Express + rutas + static
    ├── db.js               # SQLite + migraciones + seed
    ├── auth.js             # login + middlewares requireAuth
    └── submissions.js      # CRUD de registros
```
