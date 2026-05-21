// src/pages/AvancePage.jsx
import { useState, useEffect } from 'react'
import { apiFetch } from '../utils/apiFetch'
import { ICONOS_RUTA } from '../utils/rutaIconos'
import TrailSVG from '../components/TrailSVG'

const DESCRIPCION_RUTA = {
  'Ruta Kikapú':   'Salud y bienestar',
  'Ruta Maya':     'Medio ambiente y sostenibilidad',
  'Ruta Otomí':    'Habilidades para la vida',
  'Ruta Wixárica': 'Paz y participación comunitaria',
}

function AvancePage() {
  const [rutas, setRutas] = useState([])
  const [objetivosPorRuta, setObjetivosPorRuta] = useState({})
  const [roverObjetivos, setRoverObjetivos] = useState([])
  const [esScouter, setEsScouter] = useState(false)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    Promise.all([
      apiFetch('/api/rutas'),
      apiFetch('/api/objetivos/rover'),
      apiFetch('/api/me'),
    ]).then(async ([rutasData, roverObjData, meData]) => {
      const rutasList = Array.isArray(rutasData) ? rutasData : []
      setRutas(rutasList)
      setRoverObjetivos(Array.isArray(roverObjData) ? roverObjData : [])
      setEsScouter(meData?.tipo === 'scouter')

      const entries = await Promise.all(
        rutasList.map(async (ruta) => {
          const data = await apiFetch(`/api/objetivos?ruta_id=${ruta.id}`)
          return [ruta.id, Array.isArray(data) ? data : []]
        })
      )
      setObjetivosPorRuta(Object.fromEntries(entries))
      setCargando(false)
    })
  }, [])

  function estadoObjetivo(objetivoId) {
    return roverObjetivos.find(ro => ro.objetivo_id === objetivoId)?.estado ?? null
  }

  const todosObjetivos = Object.values(objetivosPorRuta).flat()
  const totalCompletados = roverObjetivos.filter(ro => ro.estado === 'completado').length
  const totalEnProgreso  = roverObjetivos.filter(ro => ro.estado === 'en_progreso').length
  const totalSinIniciar  = todosObjetivos.length - totalCompletados - totalEnProgreso

  return (
    <div className="proyectos-page">

      {/* Header banner */}
      <div className="avance-header">
        <div className="avance-header__left">
          <span className="avance-header__camino">
            TU CAMINO · {esScouter ? 'SCOUTER' : 'ROVER'}
          </span>
          <h1 className="avance-header__titulo">Mi Avance</h1>
          {!cargando && (
            <p className="avance-header__sub">
              {totalCompletados + totalEnProgreso} de {todosObjetivos.length} objetivos en marcha · seguí avanzando senda a senda.
            </p>
          )}
        </div>
        {!cargando && (
          <div className="avance-header__stats">
            <div className="avance-header__stat">
              <span className="avance-header__stat-num avance-header__stat-num--completado">{totalCompletados}</span>
              <span className="avance-header__stat-label">Completados</span>
            </div>
            <div className="avance-header__stat">
              <span className="avance-header__stat-num avance-header__stat-num--progreso">{totalEnProgreso}</span>
              <span className="avance-header__stat-label">En Progreso</span>
            </div>
            <div className="avance-header__stat">
              <span className="avance-header__stat-num avance-header__stat-num--sin">{totalSinIniciar}</span>
              <span className="avance-header__stat-label">Sin Iniciar</span>
            </div>
          </div>
        )}
      </div>

      {cargando ? (
        <p className="proyectos-page__empty">Cargando...</p>
      ) : (
        <>

          {/* Cards por ruta */}
          {rutas.map((ruta) => {
            const objetivos   = objetivosPorRuta[ruta.id] || []
            const completados = objetivos.filter(o => estadoObjetivo(o.id) === 'completado').length
            const pct         = objetivos.length > 0 ? Math.round((completados / objetivos.length) * 100) : 0
            const estaCompleta = pct === 100 && objetivos.length > 0
            const color       = ruta.color || '#3AABA8'
            const icono       = ICONOS_RUTA[ruta.nombre]
            const categoria   = DESCRIPCION_RUTA[ruta.nombre] || ''
            const siguiente   = objetivos.find(o => estadoObjetivo(o.id) !== 'completado')

            return (
              <div key={ruta.id} className="avance-ruta-card">
                <div className="avance-ruta-card__header">

                  <div className="avance-ruta-card__left">
                    {icono && (
                      <img src={icono} alt={ruta.nombre} className="avance-ruta-card__icon" />
                    )}
                    <div className="avance-ruta-card__info">
                      <div className="avance-ruta-card__nombre-row">
                        <h2 className="avance-ruta-card__nombre">{ruta.nombre}</h2>
                        {categoria && (
                          <span className="avance-ruta-card__categoria" style={{ color }}>
                            {categoria.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <p className="avance-ruta-card__hitos">
                        {completados} / {objetivos.length} hitos alcanzados
                        {!estaCompleta && siguiente && (
                          <> · siguiente: <span style={{ color, fontWeight: 600 }}>{siguiente.descripcion}</span></>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="avance-ruta-card__pct-section">
                    {estaCompleta && (
                      <span className="avance-ruta-card__completa-badge" style={{ background: color }}>
                        ✓ COMPLETA
                      </span>
                    )}
                    <span className="avance-ruta-card__pct-num" style={{ color }}>
                      {pct}<span className="avance-ruta-card__pct-simbolo">%</span>
                    </span>
                    <span className="avance-ruta-card__pct-label">Completado</span>
                  </div>

                </div>
                <TrailSVG
                  objetivos={objetivos}
                  estadoObjetivo={estadoObjetivo}
                  color={color}
                />
              </div>
            )
          })}
        </>
      )}

    </div>
  )
}

export default AvancePage
