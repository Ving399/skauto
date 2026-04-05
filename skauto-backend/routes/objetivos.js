// skauto-backend/routes/objetivos.js

import { Router } from 'express'
import { verifyToken } from '../middleware/auth.js'
import { supabase } from '../supabaseClient.js'

const router = Router()

// GET /api/objetivos?ruta_id=xxx — trae todos los objetivos de una ruta
router.get('/', async (req, res) => {
  const { ruta_id } = req.query
  if (!ruta_id) return res.status(400).json({ error: 'ruta_id es requerido' })

  const { data, error } = await supabase
    .from('objetivos_educativos')
    .select('*')
    .eq('ruta_id', ruta_id)
    .order('numero', { ascending: true })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// GET /api/objetivos/rover — trae todos los rover_objetivos del rover autenticado
router.get('/rover', verifyToken, async (req, res) => {
  const roverId = req.user.id

  const { data, error } = await supabase
    .from('rover_objetivos')
    .select('*')
    .eq('rover_id', roverId)

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// POST /api/objetivos/rover/sync — sincroniza la selección de objetivos del rover
// Recibe { seleccionados: [uuid, uuid, ...] } — los ids que el rover tiene marcados
// Inserta los nuevos en_progreso y elimina los que se desmarcaron (respeta los completados)
router.post('/rover/sync', verifyToken, async (req, res) => {
  const roverId = req.user.id
  const { seleccionados } = req.body

  if (!Array.isArray(seleccionados)) {
    return res.status(400).json({ error: 'seleccionados debe ser un array de ids' })
  }

  // 1. Traer el estado actual del rover
  const { data: actuales, error: errorActuales } = await supabase
    .from('rover_objetivos')
    .select('*')
    .eq('rover_id', roverId)

  if (errorActuales) return res.status(500).json({ error: errorActuales.message })

  const completados = actuales.filter(o => o.estado === 'completado').map(o => o.objetivo_id)
  const enProgreso  = actuales.filter(o => o.estado === 'en_progreso').map(o => o.objetivo_id)

  // 2. Insertar los que no existían y no están completados
  const aInsertar = seleccionados.filter(id => !completados.includes(id) && !enProgreso.includes(id))

  // 3. Eliminar los que estaban en_progreso pero ya no están seleccionados
  const aEliminar = enProgreso.filter(id => !seleccionados.includes(id))

  const operaciones = []

  if (aInsertar.length > 0) {
    operaciones.push(
      supabase.from('rover_objetivos').insert(
        aInsertar.map(objetivo_id => ({ rover_id: roverId, objetivo_id, estado: 'en_progreso' }))
      )
    )
  }

  if (aEliminar.length > 0) {
    operaciones.push(
      supabase.from('rover_objetivos')
        .delete()
        .eq('rover_id', roverId)
        .in('objetivo_id', aEliminar)
    )
  }

  const resultados = await Promise.all(operaciones)
  const errorOp = resultados.find(r => r.error)
  if (errorOp) return res.status(500).json({ error: errorOp.error.message })

  res.json({ mensaje: 'Objetivos sincronizados' })
})

export default router
