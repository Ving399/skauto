# SKAuto — contexto del proyecto

## Descripción
App para scouts rovers. Permite gestionar proyectos, hacer seguimiento de objetivos educativos y visualizar avance. Cada usuario es un "rover" autenticado con Google.

## Stack
- Frontend: React + Vite — `skauto-app/` (localhost:5173)
- Backend: Node.js + Express — `skauto-backend/` (localhost:3001)
- Base de datos: Supabase (PostgreSQL)
- Auth: Google OAuth via Supabase

## Rutas del frontend (React Router)

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/login` | `LoginPage` | Pública — login con Google |
| `/proyectos` | `ProyectosPage` | Lista de proyectos del rover |
| `/proyectos/:id/configurar` | `ProyectoFormPage` | Detalle y edición de un proyecto |
| `/avance` | `AvancePage` | Pendiente — métricas e insignias |
| `/tools` | `ToolsPage` | Pendiente |

## Estructura del frontend (`skauto-app/src/`)

```
App.jsx               — Router principal + manejo de sesión
layouts/
  MainLayouts.jsx     — Layout con Sidebar + Outlet, maneja toggle mobile
pages/
  LoginPage.jsx
  ProyectosPage.jsx   — Grid de proyectos con modal para crear
  ProyectoFormPage.jsx — Vista/edición completa de un proyecto
  AvancePage.jsx      — Placeholder
  ToolsPage.jsx       — Placeholder
components/
  Sidebar.jsx         — Navegación lateral
  SideBarItem.jsx
  CrearProyectoModal.jsx — Modal para crear proyecto (nombre + ruta)
  ObjetivosAcordeon.jsx  — Acordeón agrupado por área para objetivos educativos
  ListaEditable.jsx   — Lista de strings con agregar/eliminar ítems
utils/
  apiFetch.js         — Wrapper de fetch que inyecta el JWT de Supabase
  ods.js              — Datos de los 17 ODS (num, nombre, color, emoji)
  rutaIconos.js       — Mapeo de nombre de ruta → ícono SVG
```

## API Backend (`skauto-backend/`)

### Rutas de usuarios
- `GET /api/me` — datos del rover autenticado

### Rutas de proyectos (`/api/proyectos`)
- `GET /` — todos los proyectos del rover (incluye `rutas.nombre`)
- `POST /` — crear proyecto (`nombre`, `ruta_id`)
- `GET /:id` — proyecto específico
- `PUT /:id` — actualizar campos del proyecto
- `DELETE /:id` — eliminar proyecto

### Rutas de rutas (`/api/rutas`)
- `GET /` — todas las rutas disponibles

### Rutas de objetivos (`/api/objetivos`)
- `GET /?ruta_id=xxx` — objetivos educativos de una ruta (público)
- `GET /rover` — rover_objetivos del rover autenticado
- `POST /rover/sync` — sincroniza selección (`{ seleccionados: [uuid...] }`)

## Base de datos (Supabase / PostgreSQL)

### rovers
| campo | tipo |
|-------|------|
| id | uuid (PK = auth.users.id) |
| nombre | text |
| email | text |
| created_at | timestamptz |

### rutas
| campo | tipo |
|-------|------|
| id | uuid |
| nombre | text |
| descripcion | text |
| color | text (hex) |

Rutas existentes: Ruta Wixárica (#9C27B0), Ruta Maya (#4CAF50), Ruta Kikapú (#2196F3), Ruta Otomí (#FF9800)

### proyectos
| campo | tipo |
|-------|------|
| id | uuid |
| rover_id | uuid FK→rovers |
| ruta_id | uuid FK→rutas |
| nombre | text |
| descripcion | text |
| objetivo_general | text |
| obj_particulares | array |
| motivacion | text |
| acciones | array |
| lugar | text |
| involucrados | array |
| recursos | array |
| ods | array (números 1-17) |
| fecha_inicio | date |
| fecha_fin | date |
| aprendizajes | text |
| estado | text (`borrador`, `activo`, `pausado`, `completo`) |
| created_at | timestamptz |

### objetivos_educativos
| campo | tipo |
|-------|------|
| id | uuid |
| ruta_id | uuid FK→rutas |
| area | text (ej: "Relación conmigo mismo", "Relación con el entorno", etc.) |
| descripcion | text |
| numero | int4 |

### rover_objetivos
| campo | tipo |
|-------|------|
| id | uuid |
| rover_id | uuid FK→rovers |
| objetivo_id | uuid FK→objetivos_educativos |
| estado | text (`en_progreso`, `completado`) |
| fecha_completado | date |

## Auth
- El JWT viene de Supabase al hacer login con Google
- El backend lo verifica con `supabase.auth.getUser(token)` en el middleware `verifyToken`
- `req.user.id` = `rovers.id` = `auth.users.id`
- El frontend inyecta el token via `apiFetch` en cada request

## Notas importantes
- Los objetivos `completado` están bloqueados en la UI (no se pueden desmarcar)
- La sincronización de objetivos es global por rover (no por proyecto)
- `AvancePage` y `ToolsPage` son placeholders sin implementar
