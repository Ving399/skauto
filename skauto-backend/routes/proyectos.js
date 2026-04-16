// skauto-backend/routes/proyectos.js

import { Router } from 'express'
import { verifyToken } from '../middleware/auth.js'
import { supabase } from '../supabaseClient.js'

const router = Router()

// Todas las rutas usan verifyToken — ninguna es pública
// req.user.id es el UUID del rover autenticado

// GET /api/proyectos — si es rover: sus proyectos. Si es scouter: proyectos de todos los rovers de su clan
router.get('/', verifyToken, async (req, res) => {
  const userId = req.user.id

  const { data: perfil, error: perfilError } = await supabase
    .from('rovers')
    .select('tipo, clan_id')
    .eq('id', userId)
    .single()

  if (perfilError) return res.status(500).json({ error: perfilError.message })

  if (perfil.tipo === 'scouter') {
    if (!perfil.clan_id) return res.json([])

    // Traer todos los rovers del clan
    const { data: clanRovers, error: clanError } = await supabase
      .from('rovers')
      .select('id, nombre')
      .eq('clan_id', perfil.clan_id)
      .eq('tipo', 'rover')

    if (clanError) return res.status(500).json({ error: clanError.message })
    if (!clanRovers.length) return res.json([])

    const roverIds = clanRovers.map(r => r.id)
    const roverNombres = Object.fromEntries(clanRovers.map(r => [r.id, r.nombre]))

    const { data, error } = await supabase
      .from('proyectos')
      .select('*, rutas(nombre)')
      .in('rover_id', roverIds)
      .order('created_at', { ascending: false })

    if (error) return res.status(500).json({ error: error.message })

    // Inyectar nombre del rover en cada proyecto
    return res.json(data.map(p => ({ ...p, rover_nombre: roverNombres[p.rover_id] ?? null })))
  }

  // Rover normal — solo sus proyectos
  const { data, error } = await supabase
    .from('proyectos')
    .select('*, rutas(nombre)')
    .eq('rover_id', userId)
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// POST /api/proyectos — crea un proyecto nuevo para el rover
router.post('/', verifyToken, async (req, res) => {
  const roverId = req.user.id
  const { nombre, ruta_id } = req.body
  if (!nombre || !ruta_id) {
    return res.status(400).json({ error: 'nombre y ruta_id son requeridos' })
  }
  const { data, error } = await supabase
    .from('proyectos')
    .insert({ rover_id: roverId, nombre, ruta_id })
    .select()
    .single()
  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
})

// GET /api/proyectos/:id — trae un proyecto específico del rover
router.get('/:id', verifyToken, async (req, res) => {
  const roverId = req.user.id
  const { id } = req.params
  const { data, error } = await supabase
    .from('proyectos')
    .select('*, rutas(nombre)')
    .eq('id', id)
    .eq('rover_id', roverId)
    .single()
  if (error) return res.status(404).json({ error: 'Proyecto no encontrado' })
  res.json(data)
})

// PUT /api/proyectos/:id — actualiza un proyecto existente del rover
router.put('/:id', verifyToken, async (req, res) => {
  const roverId = req.user.id
  const { id } = req.params
  const campos = req.body
  // Convertir strings vacíos en campos de fecha a null para que Postgres los acepte
  if (campos.fecha_inicio === '') campos.fecha_inicio = null
  if (campos.fecha_fin === '') campos.fecha_fin = null
  const { data, error } = await supabase
    .from('proyectos')
    .update(campos)
    .eq('id', id)
    .eq('rover_id', roverId) // seguridad: solo puede editar los suyos
    .select()
    .single()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// DELETE /api/proyectos/:id — borra un proyecto del rover
router.delete('/:id', verifyToken, async (req, res) => {
  const roverId = req.user.id
  const { id } = req.params
  const { error } = await supabase
    .from('proyectos')
    .delete()
    .eq('id', id)
    .eq('rover_id', roverId) // seguridad: solo puede borrar los suyos
  if (error) return res.status(500).json({ error: error.message })
  res.json({ mensaje: 'Proyecto eliminado' })
})

export default router