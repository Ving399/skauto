// skauto-backend/routes/proyectos.js

import { Router } from 'express'
import { verifyToken } from '../middleware/auth.js'
import { supabase } from '../supabaseClient.js'

const router = Router()

// Todas las rutas usan verifyToken — ninguna es pública
// req.user.id es el UUID del rover autenticado

// Calcula el estado automático según campos del proyecto
function calcularEstado(fecha_inicio, fecha_fin) {
  return (fecha_inicio && fecha_fin) ? 'proyecto' : 'anteproyecto'
}

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
      .select('*, rutas(nombre, descripcion, color)')
      .in('rover_id', roverIds)
      .order('created_at', { ascending: false })

    if (error) return res.status(500).json({ error: error.message })

    // Inyectar nombre del rover en cada proyecto
    return res.json(data.map(p => ({ ...p, rover_nombre: roverNombres[p.rover_id] ?? null })))
  }

  // Rover normal — solo sus proyectos
  const { data, error } = await supabase
    .from('proyectos')
    .select('*, rutas(nombre, descripcion, color)')
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
    .insert({ rover_id: roverId, nombre, ruta_id, estado: 'anteproyecto' })
    .select()
    .single()
  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
})

// GET /api/proyectos/:id — trae un proyecto específico (rover: el suyo; scouter: de su clan)
router.get('/:id', verifyToken, async (req, res) => {
  const userId = req.user.id
  const { id } = req.params

  const { data: perfil } = await supabase
    .from('rovers')
    .select('tipo, clan_id')
    .eq('id', userId)
    .single()

  if (perfil?.tipo === 'scouter') {
    // Scouter: puede ver proyectos de rovers de su clan
    const { data: clanRovers } = await supabase
      .from('rovers')
      .select('id')
      .eq('clan_id', perfil.clan_id)
      .eq('tipo', 'rover')

    const roverIds = (clanRovers || []).map(r => r.id)

    const { data, error } = await supabase
      .from('proyectos')
      .select('*, rutas(nombre, descripcion, color)')
      .eq('id', id)
      .in('rover_id', roverIds)
      .single()

    if (error || !data) return res.status(404).json({ error: 'Proyecto no encontrado' })
    return res.json(data)
  }

  // Rover normal — solo el suyo
  const { data, error } = await supabase
    .from('proyectos')
    .select('*, rutas(nombre, descripcion, color)')
    .eq('id', id)
    .eq('rover_id', userId)
    .single()

  if (error) return res.status(404).json({ error: 'Proyecto no encontrado' })
  res.json(data)
})

// PUT /api/proyectos/:id — actualiza un proyecto existente del rover
router.put('/:id', verifyToken, async (req, res) => {
  const roverId = req.user.id
  const { id } = req.params
  const campos = req.body

  // Normalizar fechas vacías a null
  if (campos.fecha_inicio === '') campos.fecha_inicio = null
  if (campos.fecha_fin === '') campos.fecha_fin = null

  // El rover no puede establecer el estado manualmente
  delete campos.estado

  // Verificar que el proyecto existe y pertenece al rover; leer estado actual
  const { data: actual, error: fetchErr } = await supabase
    .from('proyectos')
    .select('estado, fecha_inicio, fecha_fin')
    .eq('id', id)
    .eq('rover_id', roverId)
    .single()

  if (fetchErr || !actual) return res.status(404).json({ error: 'Proyecto no encontrado' })

  // Solo auto-calcular estado si no está finalizado
  if (actual.estado !== 'finalizado') {
    const fi = campos.fecha_inicio !== undefined ? campos.fecha_inicio : actual.fecha_inicio
    const ff = campos.fecha_fin    !== undefined ? campos.fecha_fin    : actual.fecha_fin
    campos.estado = calcularEstado(fi, ff)
  }

  const { data, error } = await supabase
    .from('proyectos')
    .update(campos)
    .eq('id', id)
    .eq('rover_id', roverId)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// PATCH /api/proyectos/:id/finalizar — solo el scouter puede marcar un proyecto como finalizado
router.patch('/:id/finalizar', verifyToken, async (req, res) => {
  const userId = req.user.id

  // Verificar que es scouter
  const { data: perfil, error: perfilError } = await supabase
    .from('rovers')
    .select('tipo, clan_id')
    .eq('id', userId)
    .single()

  if (perfilError) return res.status(500).json({ error: perfilError.message })
  if (perfil.tipo !== 'scouter') return res.status(403).json({ error: 'Solo un scouter puede finalizar proyectos' })
  if (!perfil.clan_id) return res.status(403).json({ error: 'No tenés clan asignado' })

  // Obtener rovers del clan
  const { data: clanRovers, error: clanError } = await supabase
    .from('rovers')
    .select('id')
    .eq('clan_id', perfil.clan_id)
    .eq('tipo', 'rover')

  if (clanError) return res.status(500).json({ error: clanError.message })

  const roverIds = (clanRovers || []).map(r => r.id)
  if (!roverIds.length) return res.status(404).json({ error: 'No hay rovers en tu clan' })

  const { id } = req.params
  const { data, error } = await supabase
    .from('proyectos')
    .update({ estado: 'finalizado' })
    .eq('id', id)
    .in('rover_id', roverIds)
    .select()
    .single()

  if (error || !data) return res.status(404).json({ error: 'Proyecto no encontrado o no pertenece a tu clan' })
  res.json(data)
})

// GET /api/proyectos/:id/competencias — lista competencias vinculadas al proyecto
router.get('/:id/competencias', verifyToken, async (req, res) => {
  const userId = req.user.id
  const { id } = req.params

  // Verificar acceso al proyecto
  const { data: perfil } = await supabase.from('rovers').select('tipo, clan_id').eq('id', userId).single()

  let proyectoQuery = supabase.from('proyectos').select('rover_id').eq('id', id)
  if (perfil?.tipo === 'rover') proyectoQuery = proyectoQuery.eq('rover_id', userId)
  const { data: proyecto, error: proyErr } = await proyectoQuery.single()
  if (proyErr || !proyecto) return res.status(404).json({ error: 'Proyecto no encontrado' })

  const { data, error } = await supabase
    .from('proyecto_competencias')
    .select('id, competencia_id, competencias(id, nombre, estado, temas_competencia(nombre))')
    .eq('proyecto_id', id)
    .order('created_at', { ascending: true })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// GET /api/proyectos/:id/competencias/disponibles — competencias del rover no vinculadas a ningún proyecto
router.get('/:id/competencias/disponibles', verifyToken, async (req, res) => {
  const roverId = req.user.id
  const { id } = req.params

  // Verificar que el proyecto pertenece al rover
  const { data: proyecto, error: proyErr } = await supabase
    .from('proyectos').select('rover_id').eq('id', id).eq('rover_id', roverId).single()
  if (proyErr || !proyecto) return res.status(404).json({ error: 'Proyecto no encontrado' })

  // IDs ya vinculados a cualquier proyecto
  const { data: vinculadas } = await supabase
    .from('proyecto_competencias')
    .select('competencia_id')

  const idsVinculados = (vinculadas || []).map(v => v.competencia_id)

  // Competencias del rover que no están vinculadas
  let query = supabase
    .from('competencias')
    .select('id, nombre, estado, temas_competencia(nombre)')
    .eq('rover_id', roverId)
    .order('created_at', { ascending: false })

  if (idsVinculados.length > 0) {
    query = query.not('id', 'in', `(${idsVinculados.join(',')})`)
  }

  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// POST /api/proyectos/:id/competencias — vincula una competencia al proyecto
router.post('/:id/competencias', verifyToken, async (req, res) => {
  const roverId = req.user.id
  const { id } = req.params
  const { competencia_id } = req.body

  if (!competencia_id) return res.status(400).json({ error: 'competencia_id es requerido' })

  // Verificar que el proyecto es del rover
  const { data: proyecto, error: proyErr } = await supabase
    .from('proyectos').select('rover_id').eq('id', id).eq('rover_id', roverId).single()
  if (proyErr || !proyecto) return res.status(404).json({ error: 'Proyecto no encontrado' })

  // Verificar que la competencia es del rover
  const { data: competencia, error: compErr } = await supabase
    .from('competencias').select('id').eq('id', competencia_id).eq('rover_id', roverId).single()
  if (compErr || !competencia) return res.status(404).json({ error: 'Competencia no encontrada' })

  const { data, error } = await supabase
    .from('proyecto_competencias')
    .insert({ proyecto_id: id, competencia_id })
    .select('id, competencia_id, competencias(id, nombre, estado, temas_competencia(nombre))')
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
})

// DELETE /api/proyectos/:id/competencias/:cid — desvincula una competencia del proyecto
router.delete('/:id/competencias/:cid', verifyToken, async (req, res) => {
  const roverId = req.user.id
  const { id, cid } = req.params

  // Verificar que el proyecto es del rover
  const { data: proyecto, error: proyErr } = await supabase
    .from('proyectos').select('rover_id').eq('id', id).eq('rover_id', roverId).single()
  if (proyErr || !proyecto) return res.status(404).json({ error: 'Proyecto no encontrado' })

  const { error } = await supabase
    .from('proyecto_competencias')
    .delete()
    .eq('id', cid)
    .eq('proyecto_id', id)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ mensaje: 'Competencia desvinculada' })
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
