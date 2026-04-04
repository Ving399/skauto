// skauto-backend/routes/user.js

// Router es una mini-app de Express para agrupar rutas
import { Router } from 'express'
import { verifyToken } from '../middleware/auth.js'

const router = Router()

// GET /me — devuelve los datos del usuario autenticado
// verifyToken va primero y protege la ruta
// si el token es válido, req.user ya tiene los datos del usuario
router.get('/me', verifyToken, (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    nombre: req.user.user_metadata.full_name
  })
})

export default router