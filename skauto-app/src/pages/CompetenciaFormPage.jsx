// src/pages/CompetenciaFormPage.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiFetch } from '../utils/apiFetch'
import ChecklistEditable from '../components/ChecklistEditable'
import iconEdit   from '../assets/icons/edit.svg'
import iconDelete from '../assets/icons/delete (3).svg'
import iconBack   from '../assets/icons/back.svg'

const TEMA_COLORES = {
  'Salud y Bienestar':              '#5BA4CF',
  'Habilidades para la Vida':       '#F4A261',
  'Medio Ambiente y Sostenibilidad':'#4CAF50',
  'Paz y Participación Comunitaria':'#9C27B0',
}

const FORM_VACIO = {
  nombre:        '',
  objetivo:      '',
  checklist:     [],
  asesor:        '',
  correo_asesor: '',
  fecha_inicio:  '',
  fecha_fin:     '',
}

function temaGradiente(nombreTema) {
  const hex = TEMA_COLORES[nombreTema] ?? '#3AABA8'
  const n = parseInt(hex.replace('#', ''), 16)
  const adj = (v, d) => Math.min(255, Math.max(0, v + d))
  const r = n >> 16, g = (n >> 8) & 0xff, b = n & 0xff
  const claro  = `rgb(${adj(r, 55)}, ${adj(g, 55)}, ${adj(b, 55)})`
  const oscuro = `rgb(${adj(r,-45)}, ${adj(g,-45)}, ${adj(b,-45)})`
  return `linear-gradient(to right, ${claro}, ${oscuro})`
}

function CompetenciaFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [competencia, setCompetencia] = useState(null)
  const [form, setForm] = useState(FORM_VACIO)
  const [esScouter, setEsScouter] = useState(false)
  const [editando, setEditando] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [guardandoCheck, setGuardandoCheck] = useState(false)
  const [error, setError] = useState(null)
  const [confirmarEliminar, setConfirmarEliminar] = useState(false)

  useEffect(() => {
    Promise.all([
      apiFetch(`/api/competencias/${id}`),
      apiFetch('/api/me'),
    ]).then(([data, meData]) => {
      if (data.error) { setError(data.error); setCargando(false); return }
      setCompetencia(data)
      setForm(formDesde(data))
      setEsScouter(meData.tipo === 'scouter')
      setCargando(false)
    })
  }, [id])

  function formDesde(data) {
    return {
      nombre:        data.nombre        ?? '',
      objetivo:      data.objetivo      ?? '',
      checklist:     Array.isArray(data.checklist) ? data.checklist : [],
      asesor:        data.asesor        ?? '',
      correo_asesor: data.correo_asesor ?? '',
      fecha_inicio:  data.fecha_inicio  ?? '',
      fecha_fin:     data.fecha_fin     ?? '',
    }
  }

  function cancelar() {
    setForm(formDesde(competencia))
    setEditando(false)
  }

  async function guardar() {
    setGuardando(true)
    setError(null)
    const data = await apiFetch(`/api/competencias/${id}`, {
      method: 'PUT',
      body: JSON.stringify(form),
    })
    setGuardando(false)
    if (data.error) { setError(data.error); return }
    setCompetencia(data)
    setForm(formDesde(data))
    setEditando(false)
  }

  // Auto-guarda solo el checklist al marcar/desmarcar sin entrar en modo edición
  async function guardarChecklist(nuevoChecklist) {
    setForm((prev) => ({ ...prev, checklist: nuevoChecklist }))
    if (editando) return // en modo edición se guarda con el botón Guardar
    setGuardandoCheck(true)
    const data = await apiFetch(`/api/competencias/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ checklist: nuevoChecklist }),
    })
    setGuardandoCheck(false)
    if (!data.error) setCompetencia(data)
  }

  async function eliminar() {
    const data = await apiFetch(`/api/competencias/${id}`, { method: 'DELETE' })
    if (data?.error) { setError(data.error); setConfirmarEliminar(false); return }
    navigate('/competencias')
  }

  function setField(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  if (cargando) return <p className="form-page__loading">Cargando competencia...</p>
  if (error && !competencia) return <p className="form-page__loading">{error}</p>

  const nombreTema = competencia.temas_competencia?.nombre ?? ''

  return (
    <div className="form-page">

      {/* Banner */}
      <div className="form-page__banner" style={{ background: temaGradiente(nombreTema) }}>
        <div className="form-page__banner-left">
          <button className="form-page__btn-back" onClick={() => navigate('/competencias')}>
            <img src={iconBack} alt="Volver" />
          </button>
          <p className="form-page__banner-ruta">{nombreTema.toUpperCase()}</p>
          {editando
            ? <input
                className="form-page__title-input"
                value={form.nombre}
                onChange={(e) => setField('nombre', e.target.value)}
              />
            : <h1 className="form-page__title">{competencia.nombre}</h1>
          }
          <span className={`proyecto-card__estado proyecto-card__estado--${competencia.estado} form-page__banner-estado`}>
            {competencia.estado === 'iniciada' ? 'Iniciada' : 'Culminada'}
          </span>
        </div>
      </div>

      {/* Acciones */}
      <div className="form-page__header">
        {!editando ? (
          <div className="form-page__header-actions">
            {!esScouter && (
              <button className="form-page__btn-delete" onClick={() => setConfirmarEliminar(true)}>
                <img src={iconDelete} alt="" className="btn-icon" /> Eliminar
              </button>
            )}
            {!esScouter && (
              <button className="form-page__btn-edit" onClick={() => setEditando(true)}>
                <img src={iconEdit} alt="" className="btn-icon" /> Editar
              </button>
            )}
          </div>
        ) : (
          <div className="form-page__actions">
            <button className="modal__btn modal__btn--cancel" onClick={cancelar}>
              Cancelar
            </button>
            <button className="modal__btn modal__btn--confirm" onClick={guardar} disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        )}
      </div>

      {error && <p className="modal__error">{error}</p>}

      <div className="form-page__body">

        {/* Objetivo */}
        <div className="form-page__seccion-label">Objetivo</div>

        <Campo label="¿Qué quiero lograr con esta competencia?">
          {editando
            ? <textarea value={form.objetivo} onChange={(e) => setField('objetivo', e.target.value)} placeholder="Describe tu objetivo personal..." />
            : <Valor texto={form.objetivo} />}
        </Campo>

        {/* Checklist */}
        <div className="form-page__seccion-label">
          Actividades
          {guardandoCheck && <span className="checklist-guardando"> · guardando...</span>}
        </div>

        <ChecklistEditable
          items={form.checklist}
          onChange={guardarChecklist}
          editando={editando}
        />

        {/* Fechas */}
        <div className="form-page__seccion-label">Fechas</div>

        <div className="form-page__fechas">
          <Campo label="Fecha inicio">
            {editando
              ? <input type="date" value={form.fecha_inicio} onChange={(e) => setField('fecha_inicio', e.target.value)} />
              : <Valor texto={form.fecha_inicio} />}
          </Campo>
          <Campo label="Fecha fin">
            {editando
              ? <input type="date" value={form.fecha_fin} onChange={(e) => setField('fecha_fin', e.target.value)} />
              : <Valor texto={form.fecha_fin} />}
          </Campo>
        </div>

        {/* Asesor */}
        <div className="form-page__seccion-label">Asesor</div>

        <Campo label="Nombre del asesor">
          {editando
            ? <input type="text" value={form.asesor} onChange={(e) => setField('asesor', e.target.value)} placeholder="Nombre del asesor" />
            : <Valor texto={form.asesor} />}
        </Campo>

        <Campo label="Correo del asesor">
          {editando
            ? <input type="text" value={form.correo_asesor} onChange={(e) => setField('correo_asesor', e.target.value)} placeholder="correo@ejemplo.com" />
            : <Valor texto={form.correo_asesor} />}
        </Campo>

      </div>

      {/* Modal eliminar */}
      {confirmarEliminar && (
        <div className="modal-overlay" onClick={() => setConfirmarEliminar(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal__title">Eliminar competencia</h2>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              ¿Estás seguro de que querés eliminar <strong>{competencia.nombre}</strong>?
              Esta acción no se puede deshacer.
            </p>
            <div className="modal__actions">
              <button className="modal__btn modal__btn--cancel" onClick={() => setConfirmarEliminar(false)}>
                Cancelar
              </button>
              <button className="modal__btn modal__btn--delete" onClick={eliminar}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

function Campo({ label, children }) {
  return (
    <div className="form-campo">
      <label className="form-campo__label">{label}</label>
      <div className="form-campo__contenido">{children}</div>
    </div>
  )
}

function Valor({ texto }) {
  return <p className="form-campo__valor">{texto || <span className="form-page__vacio">—</span>}</p>
}

export default CompetenciaFormPage
