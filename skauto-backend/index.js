// skauto-backend/index.js

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import userRouter from './routes/user.js'
import proyectosRouter from './routes/proyectos.js'
import rutasRouter from './routes/rutas.js'
import objetivosRouter from './routes/objetivos.js'
import competenciasRouter from './routes/competencias.js'
import calendarioRouter from './routes/calendario.js'

dotenv.config()

const app = express()

const allowedOrigins = [
  'https://skauto.app',
  'https://www.skauto.app',
  'https://skauto-jet.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
]

app.use(cors({
  origin: (origin, callback) => {
    callback(null, allowedOrigins.includes(origin) || !origin)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['authorization', 'content-type'],
}))

app.use(express.json())

// Registramos las rutas de usuario bajo el prefijo /api
// Esto significa que GET /me se convierte en GET /api/me
app.use('/api', userRouter)
app.use('/api/proyectos', proyectosRouter)
app.use('/api/rutas', rutasRouter)
app.use('/api/objetivos', objetivosRouter)
app.use('/api/competencias', competenciasRouter)
app.use('/api/calendario', calendarioRouter)

// Arrancamos el servidor en el puerto definido en .env (3001)
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})