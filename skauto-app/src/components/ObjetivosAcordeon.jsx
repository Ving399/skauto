// src/components/ObjetivosAcordeon.jsx
import { useState, useEffect } from 'react'

// rutaId: id de la ruta del proyecto
// seleccionados: array de objetivo_id que el rover tiene marcados
// completados: array de objetivo_id que el rover ya completó (bloqueados)
// onChange: callback que recibe el nuevo array de seleccionados
// editando: si está en modo edición o lectura
function ObjetivosAcordeon({ rutaId, seleccionados, completados, onChange, editando }) {
  const [objetivos, setObjetivos] = useState([])
  const [abiertos, setAbiertos] = useState({})
  const [errorMsg, setErrorMsg] = useState(null)

  useEffect(() => {
    if (!rutaId) return
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/objetivos?ruta_id=${rutaId}`)
      .then(r => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setObjetivos(data)
        } else {
          setErrorMsg(data.error ?? 'Error al cargar objetivos')
        }
      })
      .catch(e => setErrorMsg(e.message))
  }, [rutaId])

  // Agrupar objetivos por área
  const porArea = objetivos.reduce((acc, obj) => {
    if (!acc[obj.area]) acc[obj.area] = []
    acc[obj.area].push(obj)
    return acc
  }, {})

  function toggleArea(area) {
    setAbiertos((prev) => ({ ...prev, [area]: !prev[area] }))
  }

  function toggleObjetivo(objetivoId) {
    if (completados.includes(objetivoId)) return // bloqueado
    const nuevo = seleccionados.includes(objetivoId)
      ? seleccionados.filter(id => id !== objetivoId)
      : [...seleccionados, objetivoId]
    onChange(nuevo)
  }

  if (errorMsg) return <p className="modal__error">{errorMsg}</p>
  if (objetivos.length === 0) return <p className="form-page__vacio">Cargando objetivos...</p>

  return (
    <div className="acordeon">
      {Object.entries(porArea).map(([area, items]) => {
        const seleccionadosEnArea = items.filter(o => seleccionados.includes(o.id) || completados.includes(o.id)).length
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
                {items.map((obj) => {
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
  )
}

export default ObjetivosAcordeon
