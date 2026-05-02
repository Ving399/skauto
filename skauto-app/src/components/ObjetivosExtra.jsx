// src/components/ObjetivosExtra.jsx
import { useState, useEffect } from 'react'
import { ICONOS_RUTA } from '../utils/rutaIconos'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// rutaIdActual: id de la ruta del proyecto (se excluye de las opciones)
// seleccionados: array de todos los objetivo_id marcados (base + extra)
// completados: array de objetivo_id completados (bloqueados)
// onChange: callback con el nuevo array completo de seleccionados
// editando: si está en modo edición
function ObjetivosExtra({ rutaIdActual, seleccionados, completados, onChange, editando }) {
  const [rutas, setRutas] = useState([])
  const [rutaActiva, setRutaActiva] = useState(null)
  const [objetivos, setObjetivos] = useState([])
  const [cargando, setCargando] = useState(false)
  const [abiertos, setAbiertos] = useState({})

  useEffect(() => {
    fetch(`${API}/api/rutas`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRutas(data.filter(r => r.id !== rutaIdActual))
        }
      })
  }, [rutaIdActual])

  useEffect(() => {
    if (!rutaActiva) { setObjetivos([]); return }
    setCargando(true)
    setAbiertos({})
    fetch(`${API}/api/objetivos?ruta_id=${rutaActiva}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setObjetivos(data)
        setCargando(false)
      })
  }, [rutaActiva])

  const porArea = objetivos.reduce((acc, obj) => {
    if (!acc[obj.area]) acc[obj.area] = []
    acc[obj.area].push(obj)
    return acc
  }, {})

  function seleccionarRuta(id) {
    setRutaActiva(prev => (prev === id ? null : id))
  }

  function toggleArea(area) {
    setAbiertos(prev => ({ ...prev, [area]: !prev[area] }))
  }

  function toggleObjetivo(objetivoId) {
    if (completados.includes(objetivoId)) return
    const nuevo = seleccionados.includes(objetivoId)
      ? seleccionados.filter(id => id !== objetivoId)
      : [...seleccionados, objetivoId]
    onChange(nuevo)
  }

  // Cuenta cuántos objetivos de una ruta están seleccionados (para badge en tab)
  function contarExtraPorRuta(rutaId) {
    const idsDeRuta = rutaActiva === rutaId
      ? objetivos.map(o => o.id)
      : []
    return idsDeRuta.filter(id => seleccionados.includes(id) || completados.includes(id)).length
  }

  return (
    <div className="obj-extra">
      <div className="obj-extra__tabs">
        {rutas.map(ruta => {
          const icono = ICONOS_RUTA[ruta.nombre]
          const activa = rutaActiva === ruta.id
          return (
            <button
              key={ruta.id}
              type="button"
              className={`obj-extra__tab ${activa ? 'obj-extra__tab--activa' : ''}`}
              style={{ '--ruta-color': ruta.color }}
              onClick={() => seleccionarRuta(ruta.id)}
            >
              {icono && <img src={icono} alt="" className="obj-extra__tab-icon" />}
              <span>{ruta.nombre}</span>
            </button>
          )
        })}
      </div>

      {rutaActiva && (
        <div className="acordeon obj-extra__acordeon">
          {cargando && <p className="form-page__vacio">Cargando objetivos...</p>}
          {!cargando && Object.entries(porArea).map(([area, items]) => {
            const seleccionadosEnArea = items.filter(o =>
              seleccionados.includes(o.id) || completados.includes(o.id)
            ).length
            const estaAbierto = abiertos[area] ?? false

            return (
              <div key={area} className="acordeon__seccion">
                <button
                  className="acordeon__header"
                  onClick={() => toggleArea(area)}
                  type="button"
                >
                  <span className="acordeon__titulo">{area}</span>
                  <div className="acordeon__meta">
                    {seleccionadosEnArea > 0 && (
                      <span className="acordeon__badge">{seleccionadosEnArea}</span>
                    )}
                    <span className="acordeon__flecha">{estaAbierto ? '▲' : '▼'}</span>
                  </div>
                </button>

                {estaAbierto && (
                  <ul className="acordeon__lista">
                    {items.map(obj => {
                      const completado = completados.includes(obj.id)
                      const marcado = seleccionados.includes(obj.id) || completado

                      return (
                        <li
                          key={obj.id}
                          className={`acordeon__item ${completado ? 'acordeon__item--completado' : ''} ${marcado && !completado ? 'acordeon__item--marcado' : ''}`}
                          onClick={() => editando && toggleObjetivo(obj.id)}
                        >
                          <span className={`acordeon__item-check ${marcado ? 'acordeon__item-check--on' : ''} ${completado ? 'acordeon__item-check--lock' : ''}`}>
                            {completado ? '🔒' : ''}
                          </span>
                          <span className="acordeon__item-texto">
                            <strong>{obj.numero}.</strong> {obj.descripcion}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ObjetivosExtra
