// skauto-backend/routes/competencias.js

import { Router } from 'express'
import { verifyToken } from '../middleware/auth.js'
import { supabase } from '../supabaseClient.js'

const router = Router()

// GET /api/temas-competencia — catálogo de temas (público para autenticados)
router.get('/temas', verifyToken, async (req, res) => {
  const { data, error } = await supabase
    .from('temas_competencia')
    .select('*')
    .order('nombre')
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// GET /api/competencias — rover: las suyas; scouter: las del clan
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
      .from('competencias')
      .select('*, temas_competencia(nombre)')
      .in('rover_id', roverIds)
      .order('created_at', { ascending: false })

    if (error) return res.status(500).json({ error: error.message })
    return res.json(data.map(c => ({ ...c, rover_nombre: roverNombres[c.rover_id] ?? null })))
  }

  // Rover normal
  const { data, error } = await supabase
    .from('competencias')
    .select('*, temas_competencia(nombre)')
    .eq('rover_id', userId)
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// POST /api/competencias — crea una competencia vacía con nombre y tema
router.post('/', verifyToken, async (req, res) => {
  const roverId = req.user.id
  const { nombre, tema_id } = req.body

  if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre es requerido' })
  if (!tema_id)        return res.status(400).json({ error: 'El tema es requerido' })

  const { data, error } = await supabase
    .from('competencias')
    .insert({ rover_id: roverId, nombre: nombre.trim(), tema_id })
    .select('*, temas_competencia(nombre)')
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
})

// GET /api/competencias/:id — trae una competencia (rover: la suya; scouter: del clan)
router.get('/:id', verifyToken, async (req, res) => {
  const userId = req.user.id
  const { id } = req.params

  const { data: perfil } = await supabase
    .from('rovers')
    .select('tipo, clan_id')
    .eq('id', userId)
    .single()

  if (perfil?.tipo === 'scouter') {
    const { data: clanRovers } = await supabase
      .from('rovers')
      .select('id')
      .eq('clan_id', perfil.clan_id)
      .eq('tipo', 'rover')

    const roverIds = (clanRovers || []).map(r => r.id)

    const { data, error } = await supabase
      .from('competencias')
      .select('*, temas_competencia(nombre, objetivo)')
      .eq('id', id)
      .in('rover_id', roverIds)
      .single()

    if (error || !data) return res.status(404).json({ error: 'Competencia no encontrada' })
    return res.json(data)
  }

  const { data, error } = await supabase
    .from('competencias')
    .select('*, temas_competencia(nombre, objetivo)')
    .eq('id', id)
    .eq('rover_id', userId)
    .single()

  if (error || !data) return res.status(404).json({ error: 'Competencia no encontrada' })
  res.json(data)
})

// PATCH /api/competencias/:id/culminar — solo el scouter del clan puede culminar
router.patch('/:id/culminar', verifyToken, async (req, res) => {
  const userId = req.user.id

  const { data: perfil, error: perfilError } = await supabase
    .from('rovers')
    .select('tipo, clan_id')
    .eq('id', userId)
    .single()

  if (perfilError) return res.status(500).json({ error: perfilError.message })
  if (perfil.tipo !== 'scouter') return res.status(403).json({ error: 'Solo un scouter puede culminar competencias' })
  if (!perfil.clan_id) return res.status(403).json({ error: 'No tienes clan asignado' })

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
    .from('competencias')
    .update({ estado: 'culminada' })
    .eq('id', id)
    .in('rover_id', roverIds)
    .select('*, temas_competencia(nombre, objetivo)')
    .single()

  if (error || !data) return res.status(404).json({ error: 'Competencia no encontrada o no pertenece a tu clan' })
  res.json(data)
})

// DELETE /api/competencias/:id — solo el rover dueño puede borrarla
router.delete('/:id', verifyToken, async (req, res) => {
  const roverId = req.user.id
  const { id } = req.params
  const { error } = await supabase
    .from('competencias')
    .delete()
    .eq('id', id)
    .eq('rover_id', roverId)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ mensaje: 'Competencia eliminada' })
})

// PUT /api/competencias/:id — actualiza nombre, asesor, fechas
router.put('/:id', verifyToken, async (req, res) => {
  const roverId = req.user.id
  const { id } = req.params
  const { nombre, objetivo, checklist, asesor, correo_asesor, fecha_inicio, fecha_fin } = req.body

  const campos = {}
  if (nombre        !== undefined) campos.nombre        = nombre?.trim() || null
  if (objetivo      !== undefined) campos.objetivo      = objetivo      || null
  if (checklist     !== undefined) campos.checklist     = checklist
  if (asesor        !== undefined) campos.asesor        = asesor        || null
  if (correo_asesor !== undefined) campos.correo_asesor = correo_asesor || null
  if (fecha_inicio  !== undefined) campos.fecha_inicio  = fecha_inicio  || null
  if (fecha_fin     !== undefined) campos.fecha_fin     = fecha_fin     || null

  if (campos.nombre === null) return res.status(400).json({ error: 'El nombre no puede estar vacío' })

  const { data, error } = await supabase
    .from('competencias')
    .update(campos)
    .eq('id', id)
    .eq('rover_id', roverId)
    .select('*, temas_competencia(nombre, objetivo)')
    .single()

  if (error || !data) return res.status(404).json({ error: 'Competencia no encontrada' })
  res.json(data)
})

export default router
