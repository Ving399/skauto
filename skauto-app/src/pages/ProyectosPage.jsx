// src/pages/ProyectosPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../utils/apiFetch'
import CrearProyectoModal from '../components/CrearProyectoModal'
import { ICONOS_RUTA } from '../utils/rutaIconos'
import iconRocket from '../assets/icons/rocket.svg'

const ESTADO_LABEL = {
  anteproyecto: 'Anteproyecto',
  proyecto:     'Proyecto',
  finalizado:   'Finalizado',
}

function ProyectosPage() {
  const navigate = useNavigate()
  const [proyectos, setProyectos] = useState([])
  const [esScouter, setEsScouter] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [confirmarFinalizar, setConfirmarFinalizar] = useState(null) // id del proyecto a finalizar
  const [finalizando, setFinalizando] = useState(false)

  useEffect(() => {
    Promise.all([
      apiFetch('/api/proyectos'),
      apiFetch('/api/me'),
    ]).then(([proyectosData, meData]) => {
      setProyectos(Array.isArray(proyectosData) ? proyectosData : [])
      setEsScouter(meData.tipo === 'scouter')
      setCargando(false)
    })
  }, [])

  async function finalizarProyecto() {
    if (!confirmarFinalizar) return
    setFinalizando(true)
    const data = await apiFetch(`/api/proyectos/${confirmarFinalizar}/finalizar`, { method: 'PATCH' })
    setFinalizando(false)
    if (!data.error) {
      setProyectos(prev => prev.map(p => p.id === confirmarFinalizar ? { ...p, estado: 'finalizado' } : p))
    }
    setConfirmarFinalizar(null)
  }

  return (
    <div className="proyectos-page">

      <div className="proyectos-page__header">
        <h1>{esScouter ? 'Proyectos del clan' : 'Mis Proyectos'}</h1>
        {!esScouter && (
          <button className="btn-crear" onClick={() => setModalAbierto(true)}>
            <img src={iconRocket} alt="" className="btn-crear__icon" />
            <span className="btn-crear__text--full">Crear proyecto</span>
            <span className="btn-crear__text--short">Crear</span>
          </button>
        )}
      </div>

      {cargando ? (
        <p className="proyectos-page__empty">Cargando...</p>
      ) : proyectos.length === 0 ? (
        <p className="proyectos-page__empty">
          {esScouter ? 'No hay proyectos en tu clan todavía.' : 'No tenés proyectos todavía.'}
        </p>
      ) : (
        <div className="proyectos-grid">
          {proyectos.map((p) => (
            <div
              key={p.id}
              className="proyecto-card"
              onClick={() => navigate(`/proyectos/${p.id}/configurar`)}
            >
              {p.rover_nombre && (
                <span className="proyecto-card__rover">{p.rover_nombre}</span>
              )}

              <h2 className="proyecto-card__nombre">{p.nombre}</h2>

              <p className="proyecto-card__descripcion">
                {p.descripcion || 'Sin descripción aún.'}
              </p>

              <div className="proyecto-card__footer">
                <span className={`proyecto-card__estado proyecto-card__estado--${p.estado}`}>
                  {ESTADO_LABEL[p.estado] ?? p.estado}
                </span>
                {p.rutas?.nombre && (
                  <img
                    src={ICONOS_RUTA[p.rutas.nombre]}
                    alt={p.rutas.nombre}
                    className="proyecto-card__ruta-icon"
                  />
                )}
              </div>

              {esScouter && p.estado !== 'finalizado' && (
                <button
                  className="proyecto-card__btn-finalizar"
                  onClick={(e) => { e.stopPropagation(); setConfirmarFinalizar(p.id) }}
                >
                  Marcar como Finalizado
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {modalAbierto && (
        <CrearProyectoModal onClose={() => setModalAbierto(false)} />
      )}

      {/* Modal confirmación finalizar */}
      {confirmarFinalizar && (
        <div className="modal-overlay" onClick={() => setConfirmarFinalizar(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal__title">Finalizar proyecto</h2>
            <p style={{ color: '#a6adc8', fontSize: '0.9rem' }}>
              ¿Estás seguro de que querés marcar este proyecto como <strong style={{ color: '#cdd6f4' }}>Finalizado</strong>?
              Solo vos, como scouter, podés hacer esto.
            </p>
            <div className="modal__actions">
              <button className="modal__btn modal__btn--cancel" onClick={() => setConfirmarFinalizar(null)}>
                Cancelar
              </button>
              <button className="modal__btn modal__btn--confirm" onClick={finalizarProyecto} disabled={finalizando}>
                {finalizando ? 'Guardando...' : 'Finalizar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default ProyectosPage
