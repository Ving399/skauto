// src/components/ActividadesLista.jsx
import { useState, useEffect } from 'react'
import { apiFetch } from '../utils/apiFetch'
import TimePicker from './TimePicker'

const FORM_VACIO = { titulo: '', descripcion: '', fecha: '', hora_inicio: '', hora_fin: '' }

function formatFecha(fechaStr) {
  if (!fechaStr) return null
  const [y, m, d] = fechaStr.split('-')
  return `${d}/${m}/${y}`
}

export default function ActividadesLista({ proyectoId, editando }) {
  const [actividades, setActividades] = useState([])
  const [modalAbierto, setModalAbierto]     = useState(false)
  const [confirmando, setConfirmando]       = useState(null)
  const [form, setForm]                     = useState(FORM_VACIO)
  const [guardando, setGuardando]           = useState(false)
  const [error, setError]                   = useState(null)

  useEffect(() => {
    apiFetch(`/api/proyectos/${proyectoId}/actividades`).then(data => {
      setActividades(Array.isArray(data) ? data : [])
    })
  }, [proyectoId])

  function setField(k, v) { setForm(prev => ({ ...prev, [k]: v })) }

  async function handleCrear(e) {
    e.preventDefault()
    if (!form.titulo.trim()) return
    setGuardando(true)
    setError(null)
    const horario = form.hora_inicio && form.hora_fin
      ? `${form.hora_inicio} - ${form.hora_fin}`
      : form.hora_inicio || form.hora_fin || null

    const data = await apiFetch(`/api/proyectos/${proyectoId}/actividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, horario }),
    })
    setGuardando(false)
    if (data?.error) { setError(data.error); return }
    setActividades(prev => [...prev, data])
    setForm(FORM_VACIO)
    setModalAbierto(false)
  }

  async function handleEliminar() {
    const aid = confirmando.id
    await apiFetch(`/api/proyectos/${proyectoId}/actividades/${aid}`, { method: 'DELETE' })
    setActividades(prev => prev.filter(a => a.id !== aid))
    setConfirmando(null)
  }

  return (
    <div className="actividades-lista">

      {actividades.length === 0 && (
        <span className="form-page__vacio">—</span>
      )}

      {actividades.map(a => (
        <div key={a.id} className="actividad-card">
          <div className="actividad-card__main">
            <p className="actividad-card__titulo">{a.titulo}</p>
            {a.descripcion && <p className="actividad-card__desc">{a.descripcion}</p>}
          </div>
          <div className="actividad-card__meta">
            {a.fecha   && <span className="actividad-card__chip">{formatFecha(a.fecha)}</span>}
            {a.horario && <span className="actividad-card__chip">{a.horario}</span>}
          </div>
          {editando && (
            <button
              className="actividad-card__btn-eliminar"
              onClick={() => setConfirmando(a)}
              title="Eliminar actividad"
            >×</button>
          )}
        </div>
      ))}

      {editando && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button className="btn-crear" onClick={() => setModalAbierto(true)}>
            + Nueva actividad
          </button>
        </div>
      )}

      {modalAbierto && (
        <div className="modal-overlay" onClick={() => setModalAbierto(false)}>
          <div className="clan-modal" onClick={e => e.stopPropagation()}>

            <div className="clan-modal__header">
              <h2 className="clan-modal__titulo">Nueva actividad</h2>
              <button className="clan-modal__cerrar" onClick={() => setModalAbierto(false)}>×</button>
            </div>

            <form className="actividad-form" onSubmit={handleCrear}>
              <div className="actividad-form__campo">
                <label>Título *</label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={e => setField('titulo', e.target.value)}
                  placeholder="Nombre de la actividad"
                  autoFocus
                  required
                />
              </div>

              <div className="actividad-form__campo">
                <label>Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={e => setField('descripcion', e.target.value)}
                  placeholder="Detalla en qué consiste..."
                  rows={3}
                />
              </div>

              <div className="actividad-form__fila">
                <div className="actividad-form__campo">
                  <label>Fecha</label>
                  <input
                    type="date"
                    value={form.fecha}
                    onChange={e => setField('fecha', e.target.value)}
                  />
                </div>
              </div>

              <div className="actividad-form__campo">
                <label>Horario</label>
                <div className="actividad-form__horario">
                  <TimePicker
                    value={form.hora_inicio}
                    onChange={v => setField('hora_inicio', v)}
                    placeholder="Inicio"
                  />
                  <span className="actividad-form__horario-sep">a</span>
                  <TimePicker
                    value={form.hora_fin}
                    onChange={v => setField('hora_fin', v)}
                    placeholder="Fin"
                  />
                </div>
              </div>

              {error && <p className="modal__error">{error}</p>}

              <div className="modal__actions">
                <button type="button" className="modal__btn modal__btn--cancel" onClick={() => setModalAbierto(false)}>
                  Cancelar
                </button>
                <button type="submit" className="modal__btn modal__btn--confirm" disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Agregar'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {confirmando && (
        <div className="modal-overlay" onClick={() => setConfirmando(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <p className="modal__title">¿Eliminar "{confirmando.titulo}"?</p>
            <p style={{ fontSize: '0.88rem', color: '#888' }}>Esta acción no se puede deshacer.</p>
            <div className="modal__actions">
              <button className="modal__btn modal__btn--cancel" onClick={() => setConfirmando(null)}>Cancelar</button>
              <button className="modal__btn modal__btn--delete" onClick={handleEliminar}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
