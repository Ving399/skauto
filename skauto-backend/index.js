// skauto-backend/index.js

import express from 'express'
import dotenv from 'dotenv'
import userRouter from './routes/user.js'
import proyectosRouter from './routes/proyectos.js'
import rutasRouter from './routes/rutas.js'
import objetivosRouter from './routes/objetivos.js'
import competenciasRouter from './routes/competencias.js'

// Activamos dotenv para que process.env tenga las variables del .env
dotenv.config()

const app = express()

const allowedOrigins = [
  'https://skauto-iet.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
]

app.use((req, res, next) => {
  const origin = req.headers.origin
  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*')
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})

app.use(express.json())

// Registramos las rutas de usuario bajo el prefijo /api
// Esto significa que GET /me se convierte en GET /api/me
app.use('/api', userRouter)
app.use('/api/proyectos', proyectosRouter)
app.use('/api/rutas', rutasRouter)
app.use('/api/objetivos', objetivosRouter)
app.use('/api/competencias', competenciasRouter)

// Arrancamos el servidor en el puerto definido en .env (3001)
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})