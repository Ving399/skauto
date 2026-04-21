// src/pages/CompetenciasPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../utils/apiFetch'
import CrearCompetenciaModal from '../components/CrearCompetenciaModal'
import iconRocket from '../assets/icons/rocket.svg'

function CompetenciasPage() {
  const navigate = useNavigate()
  const [competencias, setCompetencias] = useState([])
  const [esScouter, setEsScouter] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [confirmarCulminar, setConfirmarCulminar] = useState(null)
  const [culminando, setCulminando] = useState(false)

  useEffect(() => {
    Promise.all([
      apiFetch('/api/competencias'),
      apiFetch('/api/me'),
    ]).then(([competenciasData, meData]) => {
      setCompetencias(Array.isArray(competenciasData) ? competenciasData : [])
      setEsScouter(meData.tipo === 'scouter')
      setCargando(false)
    })
  }, [])

  async function culminarCompetencia() {
    if (!confirmarCulminar) return
    setCulminando(true)
    const data = await apiFetch(`/api/competencias/${confirmarCulminar}/culminar`, { method: 'PATCH' })
    setCulminando(false)
    if (!data.error) {
      setCompetencias(prev => prev.map(c => c.id === confirmarCulminar ? { ...c, estado: 'culminada' } : c))
    }
    setConfirmarCulminar(null)
  }

  return (
    <div className="proyectos-page">

      <div className="proyectos-page__header">
        <h1>{esScouter ? 'Competencias del clan' : 'Mis Competencias'}</h1>
        {!esScouter && (
          <button className="btn-crear" onClick={() => setModalAbierto(true)}>
            <img src={iconRocket} alt="" className="btn-crear__icon" />
            <span className="btn-crear__text--full">Crear competencia</span>
            <span className="btn-crear__text--short">Crear</span>
          </button>
        )}
      </div>

      {cargando ? (
        <p className="proyectos-page__empty">Cargando...</p>
      ) : competencias.length === 0 ? (
        <div className="competencias-empty">
          <p className="proyectos-page__empty">
            {esScouter
              ? 'No hay competencias en tu clan todavía.'
              : 'No tienes competencias todavía.'}
          </p>
          {!esScouter && (
            <p className="competencias-empty__hint">
              Las competencias son logros de aprendizaje que puedes alcanzar a través de la metodología <strong>Conozco → Aplico → Comparto</strong>.
            </p>
          )}
        </div>
      ) : (
        <div className="proyectos-grid">
          {competencias.map((c) => (
            <div
              key={c.id}
              className="proyecto-card"
              onClick={() => navigate(`/competencias/${c.id}`)}
            >
              {c.rover_nombre && (
                <span className="proyecto-card__rover">{c.rover_nombre}</span>
              )}

              <h2 className="proyecto-card__nombre">{c.nombre}</h2>

              <p className="proyecto-card__descripcion">
                {c.objetivo || 'Sin objetivo definido aún.'}
              </p>

              <div className="proyecto-card__footer">
                <span className={`proyecto-card__estado proyecto-card__estado--${c.estado}`}>
                  {c.estado === 'iniciada' ? 'Iniciada' : 'Culminada'}
                </span>
              </div>

              {esScouter && c.estado !== 'culminada' && (
                <button
                  className="proyecto-card__btn-finalizar"
                  onClick={(e) => { e.stopPropagation(); setConfirmarCulminar(c.id) }}
                >
                  Marcar como Culminada
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {modalAbierto && (
        <CrearCompetenciaModal onClose={() => setModalAbierto(false)} />
      )}

      {confirmarCulminar && (
        <div className="modal-overlay" onClick={() => setConfirmarCulminar(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal__title">Culminar competencia</h2>
            <p style={{ color: '#a6adc8', fontSize: '0.9rem' }}>
              ¿Estás seguro de que querés marcar esta competencia como <strong style={{ color: '#cdd6f4' }}>Culminada</strong>?
              Solo vos, como scouter, podés hacer esto.
            </p>
            <div className="modal__actions">
              <button className="modal__btn modal__btn--cancel" onClick={() => setConfirmarCulminar(null)}>
                Cancelar
              </button>
              <button className="modal__btn modal__btn--confirm" onClick={culminarCompetencia} disabled={culminando}>
                {culminando ? 'Guardando...' : 'Culminar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default CompetenciasPage
