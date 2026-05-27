// skauto-backend/routes/calendario.js
import { Router } from 'express'
import { verifyToken } from '../middleware/auth.js'
import { supabase } from '../supabaseClient.js'

const router = Router()

// GET /api/calendario?year=2026&month=5
// Si tiene clan: actividades de todo el clan. Si no: solo las suyas propias.
router.get('/', verifyToken, async (req, res) => {
  const userId = req.user.id
  const year  = parseInt(req.query.year)  || new Date().getFullYear()
  const month = parseInt(req.query.month) || new Date().getMonth() + 1

  const { data: perfil, error: perfilError } = await supabase
    .from('rovers')
    .select('clan_id')
    .eq('id', userId)
    .single()

  if (perfilError) return res.status(500).json({ error: perfilError.message })

  // IDs de rovers a incluir: clan completo si tiene clan, solo el propio si no
  let roverIds = [userId]
  if (perfil.clan_id) {
    const { data: clanRovers, error: clanError } = await supabase
      .from('rovers')
      .select('id')
      .eq('clan_id', perfil.clan_id)
    if (clanError) return res.status(500).json({ error: clanError.message })
    roverIds = clanRovers.map(r => r.id)
  }

  // Proyectos de esos rovers
  const { data: proyectos, error: proyError } = await supabase
    .from('proyectos')
    .select('id, nombre')
    .in('rover_id', roverIds)

  if (proyError) return res.status(500).json({ error: proyError.message })
  if (!proyectos.length) return res.json([])

  const proyectoIds = proyectos.map(p => p.id)
  const proyectoNombre = Object.fromEntries(proyectos.map(p => [p.id, p.nombre]))

  // Rango del mes en formato ISO
  const desde = `${year}-${String(month).padStart(2, '0')}-01`
  const hasta = `${month === 12 ? year + 1 : year}-${String(month === 12 ? 1 : month + 1).padStart(2, '0')}-01`

  const { data: actividades, error: actError } = await supabase
    .from('actividades')
    .select('id, titulo, fecha, horario, proyecto_id')
    .in('proyecto_id', proyectoIds)
    .not('fecha', 'is', null)
    .gte('fecha', desde)
    .lt('fecha', hasta)
    .order('fecha', { ascending: true })

  if (actError) return res.status(500).json({ error: actError.message })

  res.json(actividades.map(a => ({
    ...a,
    proyecto_nombre: proyectoNombre[a.proyecto_id] ?? null,
  })))
})

export default router
