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
  const [cargando, setCargando] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)

  useEffect(() => {
    apiFetch('/api/proyectos').then((data) => {
      setProyectos(Array.isArray(data) ? data : [])
      setCargando(false)
    })
  }, [])

  return (
    <div className="proyectos-page">

      <div className="proyectos-page__header">
        <h1>Mis Proyectos</h1>
        <button className="btn-crear" onClick={() => setModalAbierto(true)}>
          <img src={iconRocket} alt="" className="btn-crear__icon" />
          Crear proyecto
        </button>
      </div>

      {cargando ? (
        <p className="proyectos-page__empty">Cargando...</p>
      ) : proyectos.length === 0 ? (
        <p className="proyectos-page__empty">No tenés proyectos todavía.</p>
      ) : (
        <div className="proyectos-grid">
          {proyectos.map((p) => (
            <div
              key={p.id}
              className="proyecto-card"
              onClick={() => navigate(`/proyectos/${p.id}/configurar`)}
            >
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
