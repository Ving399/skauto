// src/components/CrearCompetenciaModal.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../utils/apiFetch'

const TEMA_COLORES = {
  'Salud y Bienestar':              '#5BA4CF',
  'Habilidades para la Vida':       '#F4A261',
  'Medio Ambiente y Sostenibilidad':'#4CAF50',
  'Paz y Participación Comunitaria':'#9C27B0',
}

function CrearCompetenciaModal({ onClose }) {
  const navigate = useNavigate()

  const [temas, setTemas] = useState([])
  const [nombre, setNombre] = useState('')
  const [temaId, setTemaId] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    apiFetch('/api/competencias/temas').then((data) => {
      if (Array.isArray(data)) {
        setTemas(data)
        if (data.length > 0) setTemaId(data[0].id)
      }
    })
  }, [])

  async function handleCrear() {
    if (!nombre.trim()) { setError('El nombre es obligatorio'); return }
    if (!temaId)        { setError('Selecciona un tema'); return }
    setCargando(true)
    setError(null)
    const competencia = await apiFetch('/api/competencias', {
      method: 'POST',
      body: JSON.stringify({ nombre: nombre.trim(), tema_id: temaId })
    })
    setCargando(false)
    if (competencia.error) { setError(competencia.error); return }
    navigate(`/competencias/${competencia.id}`)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal__title">Nueva competencia</h2>

        <div className="modal__field">
          <label>Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre de la competencia"
            autoFocus
          />
        </div>

        <div className="modal__field">
          <label>Tema de especialidad</label>
          <div className="tema-selector">
            {temas.map((t) => (
              <div
                key={t.id}
                className={`tema-card ${temaId === t.id ? 'tema-card--seleccionado' : ''}`}
                style={{ '--tema-color': TEMA_COLORES[t.nombre] ?? '#888' }}
                onClick={() => setTemaId(t.id)}
              >
                <p className="tema-card__nombre">{t.nombre}</p>
                <p className="tema-card__objetivo">{t.objetivo}</p>
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
            {cargando ? 'Creando...' : 'Crear competencia'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CrearCompetenciaModal
