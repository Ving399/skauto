// skauto-backend/index.js

// Express es el framework que convierte Node.js en un servidor web
import express from 'express'

// dotenv lee el archivo .env y mete las variables en process.env
import dotenv from 'dotenv'

// cors permite que el frontend (localhost:5173) le hable al backend (localhost:3001)
// sin esto el navegador bloquea las peticiones por seguridad
import cors from 'cors'

// Importamos las rutas de usuario que creamos en el paso 6h
import userRouter from './routes/user.js'

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

// Arrancamos el servidor en el puerto definido en .env (3001)
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})