// skauto-backend/middleware/auth.js
import { supabase } from '../supabaseClient.js'

export async function verifyToken(req, res, next) {

  // Leemos el header Authorization que mandó el frontend
  const authHeader = req.headers['authorization']

  if (!authHeader) {
    return res.status(401).json({ error: 'Token no encontrado' })
  }

  // Separamos "Bearer eyJ..." y nos quedamos solo con el token
  const token = authHeader.split(' ')[1]

  // Supabase verifica si el token es válido
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    return res.status(401).json({ error: 'Token inválido' })
  }

  // Guardamos el usuario verificado para que las rutas lo puedan usar
  req.user = data.user

  next()
}