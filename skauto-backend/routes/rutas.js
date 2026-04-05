// skauto-backend/routes/rutas.js

import { Router } from 'express'
import { supabase } from '../supabaseClient.js'

const router = Router()

// GET /api/rutas — trae todas las rutas disponibles
// No requiere autenticación, son datos de referencia públicos
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('rutas')
    .select('*')
    .order('nombre', { ascending: true })
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

export default router
