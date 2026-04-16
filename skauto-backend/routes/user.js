// skauto-backend/routes/user.js

// Router es una mini-app de Express para agrupar rutas
import { Router } from 'express'
import { verifyToken } from '../middleware/auth.js'
import { supabase } from '../supabaseClient.js'

const router = Router()

// GET /api/me — devuelve los datos del usuario autenticado + clan y grupo
router.get('/me', verifyToken, async (req, res) => {
  const { data, error } = await supabase
    .from('rovers')
    .select('tipo, clan_id, clanes(nombre, grupos(numero, nombre))')
    .eq('id', req.user.id)
    .single()

  if (error) return res.status(500).json({ error: error.message })

  res.json({
    id:           req.user.id,
    email:        req.user.email,
    nombre:       req.user.user_metadata?.full_name ?? data.nombre,
    avatar_url:   req.user.user_metadata?.avatar_url ?? null,
    tipo:         data.tipo,
    clan:         data.clanes?.nombre        ?? null,
    grupo_numero: data.clanes?.grupos?.numero ?? null,
    grupo_nombre: data.clanes?.grupos?.nombre ?? null,
  })
})

export default router