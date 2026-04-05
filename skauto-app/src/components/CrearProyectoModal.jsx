// src/components/CrearProyectoModal.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../utils/apiFetch'

import { ICONOS_RUTA } from '../utils/rutaIconos'

function CrearProyectoModal({ onClose }) {
  const navigate = useNavigate()

  const [rutas, setRutas] = useState([])
  const [nombre, setNombre] = useState('')
  const [rutaId, setRutaId] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    apiFetch('/api/rutas').then((data) => {
      setRutas(data)
      if (data.length > 0) setRutaId(data[0].id)
    })
  }, [])

  async function handleCrear() {
    if (!nombre.trim()) { setError('El nombre es obligatorio'); return }
    if (!rutaId)        { setError('Seleccioná una ruta'); return }
    setCargando(true)
    setError(null)
    const proyecto = await apiFetch('/api/proyectos', {
      method: 'POST',
      body: JSON.stringify({ nombre: nombre.trim(), ruta_id: rutaId })
    })
    setCargando(false)
    if (proyecto.error) { setError(proyecto.error); return }
    navigate(`/proyectos/${proyecto.id}/configurar`)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal__title">Nuevo proyecto</h2>

        <div className="modal__field">
          <label>Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre del proyecto"
            autoFocus
          />
        </div>

        <div className="modal__field">
          <label>Ruta</label>
          <div className="ruta-selector">
            {rutas.map((r) => (
              <div
                key={r.id}
                className={`ruta-card ${rutaId === r.id ? 'ruta-card--seleccionada' : ''}`}
                style={{ '--ruta-color': r.color }}
                onClick={() => setRutaId(r.id)}
              >
                <img
                  src={ICONOS_RUTA[r.nombre]}
                  alt={r.nombre}
                  className="ruta-card__icon"
                />
                <p className="ruta-card__nombre">{r.nombre}</p>
                <p className="ruta-card__desc">{r.descripcion}</p>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="modal__error">{error}</p>}

        <div className="modal__actions">
          <button className="modal__btn modal__btn--cancel" onClick={onClose}>
            Cancelar
          </button>
          <button className="modal__btn modal__btn--confirm" onClick={handleCrear} disabled={cargando}>
            {cargando ? 'Creando...' : 'Crear proyecto'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CrearProyectoModal
