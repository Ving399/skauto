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

// GET /api/clan — devuelve todos los miembros del clan del usuario autenticado
router.get('/clan', verifyToken, async (req, res) => {
  const { data: miPerfil, error: perfilError } = await supabase
    .from('rovers')
    .select('clan_id')
    .eq('id', req.user.id)
    .single()

  if (perfilError) return res.status(500).json({ error: perfilError.message })
  if (!miPerfil.clan_id) return res.json([])

  const { data, error } = await supabase
    .from('rovers')
    .select('id, nombre, email, tipo')
    .eq('clan_id', miPerfil.clan_id)
    .order('tipo', { ascending: false })
    .order('nombre', { ascending: true })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// GET /api/clan/buscar?q=texto — busca rovers fuera del clan (solo scouters)
router.get('/clan/buscar', verifyToken, async (req, res) => {
  const userId = req.user.id
  const { q } = req.query

  const { data: perfil, error: perfilError } = await supabase
    .from('rovers').select('tipo, clan_id').eq('id', userId).single()
  if (perfilError) return res.status(500).json({ error: perfilError.message })
  if (perfil.tipo !== 'scouter') return res.status(403).json({ error: 'Solo scouters pueden buscar rovers' })

  let query = supabase
    .from('rovers')
    .select('id, nombre, email')
    .eq('tipo', 'rover')
    .or(`clan_id.is.null,clan_id.neq.${perfil.clan_id}`)
    .limit(10)

  if (q?.trim()) query = query.ilike('nombre', `%${q.trim()}%`)

  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// PATCH /api/clan/agregar — vincula un rover al clan del scouter
router.patch('/clan/agregar', verifyToken, async (req, res) => {
  const userId = req.user.id
  const { rover_id } = req.body

  const { data: perfil, error: perfilError } = await supabase
    .from('rovers').select('tipo, clan_id').eq('id', userId).single()
  if (perfilError) return res.status(500).json({ error: perfilError.message })
  if (perfil.tipo !== 'scouter') return res.status(403).json({ error: 'Solo scouters pueden agregar rovers' })
  if (!perfil.clan_id) return res.status(400).json({ error: 'No tienes clan asignado' })

  const { data, error } = await supabase
    .from('rovers')
    .update({ clan_id: perfil.clan_id })
    .eq('id', rover_id)
    .eq('tipo', 'rover')
    .select('id, nombre, email, tipo')
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// PATCH /api/clan/quitar/:roverId — desvincula un rover del clan
router.patch('/clan/quitar/:roverId', verifyToken, async (req, res) => {
  const userId = req.user.id
  const { roverId } = req.params

  const { data: perfil, error: perfilError } = await supabase
    .from('rovers').select('tipo, clan_id').eq('id', userId).single()
  if (perfilError) return res.status(500).json({ error: perfilError.message })
  if (perfil.tipo !== 'scouter') return res.status(403).json({ error: 'Solo scouters pueden quitar rovers' })

  const { error } = await supabase
    .from('rovers')
    .update({ clan_id: null })
    .eq('id', roverId)
    .eq('clan_id', perfil.clan_id)
    .eq('tipo', 'rover')

  if (error) return res.status(500).json({ error: error.message })
  res.json({ mensaje: 'Rover desvinculado del clan' })
})

export default router