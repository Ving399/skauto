# SKAuto — contexto del proyecto

## Stack
- Frontend: React + Vite — skauto-app (localhost:5173)
- Backend: Node.js + Express — skauto-backend (localhost:3001)
- Base de datos: Supabase (PostgreSQL)
- Auth: Google OAuth via Supabase

## Tablas

### rovers
id (uuid), nombre (text), email (text), created_at
→ conectada a auth.users.id

### rutas
id (uuid), nombre (text), descripcion (text), color (text)

### proyectos
id (uuid), rover_id (uuid FK→rovers), ruta_id (uuid FK→rutas),
nombre, descripcion, objetivo_general, obj_particulares,
acciones, lugar, involucrados, recursos, ods,
fecha_inicio, fecha_fin, motivacion, estado,
aprendizajes, created_at

### objetivos_educativos
id (uuid), ruta_id (uuid FK→rutas), area (text),
descripcion (text), numero (int)

### rover_objetivos
id (uuid), rover_id (uuid FK→rovers),
objetivo_id (uuid FK→objetivos_educativos),
estado (text), fecha_completado (date)

## Auth
- El JWT viene de Supabase al hacer login con Google
- El backend lo verifica con supabase.auth.getUser(token)
- req.user.id = rovers.id = auth.users.id