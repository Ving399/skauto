// src/components/CompetenciasVinculadas.jsx
import { useState, useEffect } from 'react'
import { apiFetch } from '../utils/apiFetch'

// proyectoId: id del proyecto actual
// editando: si está en modo edición
// esScouter: los scouters solo pueden ver, no vincular/desvincular
function CompetenciasVinculadas({ proyectoId, editando, esScouter = false }) {
  const [vinculadas, setVinculadas]       = useState([])
  const [disponibles, setDisponibles]     = useState([])
  const [selectorAbierto, setSelectorAbierto] = useState(false)
  const [seleccionada, setSeleccionada]   = useState(null)
  const [cargando, setCargando]           = useState(true)
  const [vinculando, setVinculando]       = useState(false)
  const [error, setError]                 = useState(null)

  useEffect(() => {
    apiFetch(`/api/proyectos/${proyectoId}/competencias`)
      .then(data => {
        if (!data.error) setVinculadas(data)
        setCargando(false)
      })
  }, [proyectoId])

  async function abrirSelector() {
    setSeleccionada(null)
    setError(null)
    const data = await apiFetch(`/api/proyectos/${proyectoId}/competencias/disponibles`)
    setDisponibles(Array.isArray(data) ? data : [])
    setSelectorAbierto(true)
  }

  function cerrarSelector() {
    setSelectorAbierto(false)
    setSeleccionada(null)
    setError(null)
  }

  async function vincular() {
    if (!seleccionada) return
    setVinculando(true)
    setError(null)
    const data = await apiFetch(`/api/proyectos/${proyectoId}/competencias`, {
      method: 'POST',
      body: JSON.stringify({ competencia_id: seleccionada }),
    })
    setVinculando(false)
    if (data.error) { setError(data.error); return }
    setVinculadas(prev => [...prev, data])
    cerrarSelector()
  }

  async function desvincular(relacionId) {
    const data = await apiFetch(`/api/proyectos/${proyectoId}/competencias/${relacionId}`, {
      method: 'DELETE',
    })
    if (data.error) { setError(data.error); return }
    setVinculadas(prev => prev.filter(v => v.id !== relacionId))
  }

  if (cargando) return <p className="form-page__vacio">Cargando...</p>

  const puedeEditar = editando && !esScouter

  return (
    <div className="comp-vinculadas">
      {/* Lista de vinculadas */}
      {vinculadas.length === 0 && !puedeEditar && (
        <span className="form-page__vacio">—</span>
      )}

      {vinculadas.length > 0 && (
        <ul className="comp-vinculadas__lista">
          {vinculadas.map(v => {
            const comp = v.competencias
            const tema = comp?.temas_competencia?.nombre
            return (
              <li key={v.id} className="comp-vinculadas__item">
                <div className="comp-vinculadas__info">
                  <span className="comp-vinculadas__nombre">{comp?.nombre ?? '—'}</span>
                  {tema && <span className="comp-vinculadas__tema">{tema}</span>}
                </div>
                <span className={`comp-vinculadas__estado comp-vinculadas__estado--${comp?.estado}`}>
                  {comp?.estado === 'culminada' ? 'Culminada' : 'Iniciada'}
                </span>
                {puedeEditar && (
                  <button
                    type="button"
                    className="comp-vinculadas__btn-quitar"
                    onClick={() => desvincular(v.id)}
                    title="Desvincular"
                  >
                    ×
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {/* Botón abrir selector */}
      {puedeEditar && !selectorAbierto && (
        <button type="button" className="comp-vinculadas__btn-agregar" onClick={abrirSelector}>
          + Vincular competencia
        </button>
      )}

      {/* Selector inline */}
      {selectorAbierto && (
        <div className="comp-vinculadas__selector">
          {disponibles.length === 0 ? (
            <p className="comp-vinculadas__empty">No tenés competencias disponibles para vincular.</p>
          ) : (
            <ul className="comp-vinculadas__opciones">
              {disponibles.map(comp => {
                const activa = seleccionada === comp.id
                return (
                  <li
                    key={comp.id}
                    className={`comp-vinculadas__opcion ${activa ? 'comp-vinculadas__opcion--activa' : ''}`}
                    onClick={() => setSeleccionada(activa ? null : comp.id)}
                  >
                    <span className={`comp-vinculadas__opcion-check ${activa ? 'comp-vinculadas__opcion-check--on' : ''}`} />
                    <div className="comp-vinculadas__opcion-info">
                      <span className="comp-vinculadas__nombre">{comp.nombre}</span>
                      {comp.temas_competencia?.nombre && (
                        <span className="comp-vinculadas__tema">{comp.temas_competencia.nombre}</span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          {error && <p className="modal__error">{error}</p>}

          <div className="comp-vinculadas__acciones">
            <button type="button" className="comp-vinculadas__btn-cancelar" onClick={cerrarSelector}>
              Cancelar
            </button>
            {disponibles.length > 0 && (
              <button
                type="button"
                className="comp-vinculadas__btn-confirmar"
                onClick={vincular}
                disabled={!seleccionada || vinculando}
              >
                {vinculando ? 'Vinculando...' : 'Vincular'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CompetenciasVinculadas
