// skauto-backend/index.js

import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import userRouter from './routes/user.js'
import proyectosRouter from './routes/proyectos.js'
import rutasRouter from './routes/rutas.js'
import objetivosRouter from './routes/objetivos.js'

// Activamos dotenv para que process.env tenga las variables del .env
dotenv.config()

const app = express()

// Le decimos a Express que acepte JSON en el body de las peticiones
app.use(express.json())

// Activamos CORS para permitir peticiones desde el frontend
app.use(cors())

// Registramos las rutas de usuario bajo el prefijo /api
// Esto significa que GET /me se convierte en GET /api/me
app.use('/api', userRouter)
app.use('/api/proyectos', proyectosRouter)
app.use('/api/rutas', rutasRouter)
app.use('/api/objetivos', objetivosRouter)

// Arrancamos el servidor en el puerto definido en .env (3001)
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})