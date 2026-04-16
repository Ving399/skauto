// src/pages/ProyectosPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../utils/apiFetch'
import CrearProyectoModal from '../components/CrearProyectoModal'
import { ICONOS_RUTA } from '../utils/rutaIconos'
import iconRocket from '../assets/icons/rocket.svg'

const ESTADO_LABEL = {
  borrador:  'Anteproyecto',
  activo:    'Activo',
  pausado:   'Pausado',
  completo:  'Completo',
}

function ProyectosPage() {
  const navigate = useNavigate()
  const [proyectos, setProyectos] = useState([])
  const [esScouter, setEsScouter] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)

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
            </div>
          ))}
        </div>
      )}

      {modalAbierto && (
        <CrearProyectoModal onClose={() => setModalAbierto(false)} />
      )}

    </div>
  )
}

export default ProyectosPage
