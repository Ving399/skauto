// src/pages/ProyectoFormPage.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiFetch } from '../utils/apiFetch'
import ListaEditable from '../components/ListaEditable'
import ObjetivosAcordeon from '../components/ObjetivosAcordeon'
import { ODS } from '../utils/ods'
import { ICONOS_RUTA } from '../utils/rutaIconos'
import iconEdit   from '../assets/icons/edit.svg'
import iconDelete from '../assets/icons/delete (3).svg'

const ESTADO_LABEL = {
  anteproyecto: 'Anteproyecto',
  proyecto:     'Proyecto',
  finalizado:   'Finalizado',
}

const FORM_VACIO = {
  nombre: '',
  descripcion: '',
  objetivo_general: '',
  obj_particulares: [],
  motivacion: '',
  acciones: [],
  lugar: '',
  involucrados: [],
  recursos: [],
  ods: [],
  fecha_inicio: '',
  fecha_fin: '',
  aprendizajes: '',
}

function ProyectoFormPage() {
  const { id } = useParams()

  const [proyecto, setProyecto] = useState(null)
  const [form, setForm] = useState(FORM_VACIO)
  const [editando, setEditando] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)
  const [confirmarEliminar, setConfirmarEliminar] = useState(false)
  const [objetivosSeleccionados, setObjetivosSeleccionados] = useState([])
  const [objetivosCompletados, setObjetivosCompletados] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      apiFetch(`/api/proyectos/${id}`),
      apiFetch('/api/objetivos/rover'),
    ]).then(([proyectoData, objetivosRover]) => {
      setProyecto(proyectoData)
      setForm({
        nombre:           proyectoData.nombre            ?? '',
        descripcion:      proyectoData.descripcion      ?? '',
        objetivo_general: proyectoData.objetivo_general ?? '',
        obj_particulares: proyectoData.obj_particulares ?? [],
        motivacion:       proyectoData.motivacion       ?? '',
        acciones:         proyectoData.acciones         ?? [],
        lugar:            proyectoData.lugar            ?? '',
        involucrados:     proyectoData.involucrados     ?? [],
        recursos:         proyectoData.recursos         ?? [],
        ods:              proyectoData.ods              ?? [],
        fecha_inicio:     proyectoData.fecha_inicio     ?? '',
        fecha_fin:        proyectoData.fecha_fin        ?? '',
        aprendizajes:     proyectoData.aprendizajes     ?? '',
      })
      const rover = Array.isArray(objetivosRover) ? objetivosRover : []
      setObjetivosCompletados(rover.filter(o => o.estado === 'completado').map(o => o.objetivo_id))
      setObjetivosSeleccionados(rover.filter(o => o.estado === 'en_progreso').map(o => o.objetivo_id))
      setCargando(false)
    })
  }, [id])

  function cancelar() {
    // Restaura el form al estado guardado en BD
    setForm({
      nombre:           proyecto.nombre            ?? '',
      descripcion:      proyecto.descripcion      ?? '',
      objetivo_general: proyecto.objetivo_general ?? '',
      obj_particulares: proyecto.obj_particulares ?? [],
      motivacion:       proyecto.motivacion       ?? '',
      acciones:         proyecto.acciones         ?? [],
      lugar:            proyecto.lugar            ?? '',
      involucrados:     proyecto.involucrados      ?? [],
      recursos:         proyecto.recursos         ?? [],
      ods:              proyecto.ods              ?? [],
      fecha_inicio:     proyecto.fecha_inicio     ?? '',
      fecha_fin:        proyecto.fecha_fin        ?? '',
      aprendizajes:     proyecto.aprendizajes     ?? '',
    })
    setEditando(false)
  }

  async function guardar() {
    setGuardando(true)
    setError(null)
    const [proyectoData, objetivosData] = await Promise.all([
      apiFetch(`/api/proyectos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      }),
      apiFetch('/api/objetivos/rover/sync', {
        method: 'POST',
        body: JSON.stringify({ seleccionados: objetivosSeleccionados }),
      }),
    ])
    setGuardando(false)
    if (proyectoData.error) { setError(proyectoData.error); return }
    if (objetivosData.error) { setError(objetivosData.error); return }
    setProyecto(proyectoData)
    setEditando(false)
  }

  async function eliminar() {
    const data = await apiFetch(`/api/proyectos/${id}`, { method: 'DELETE' })
    if (data.error) {
      setError(data.error)
      setConfirmarEliminar(false)
      return
    }
    navigate('/proyectos')
  }

  function setField(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  function toggleOds(num) {
    setForm((prev) => {
      const actual = prev.ods ?? []
      return {
        ...prev,
        ods: actual.includes(num)
          ? actual.filter((n) => n !== num)
          : [...actual, num].sort((a, b) => a - b),
      }
    })
  }

  if (cargando) return <p className="form-page__loading">Cargando proyecto...</p>

  return (
    <div className="form-page">

      {/* Banner del proyecto */}
      <div
        className="form-page__banner"
        style={{ background: rutaGradiente(proyecto.rutas?.color) }}
      >
        <div className="form-page__banner-left">
          {proyecto.rutas?.nombre && (
            <p className="form-page__banner-ruta">
              {proyecto.rutas.nombre.toUpperCase()}
              {proyecto.rutas.descripcion && ` · ${proyecto.rutas.descripcion.toUpperCase()}`}
            </p>
          )}
          {editando
            ? <input
                className="form-page__title-input"
                value={form.nombre}
                onChange={(e) => setField('nombre', e.target.value)}
              />
            : <h1 className="form-page__title">{proyecto.nombre}</h1>
          }
          <span className={`proyecto-card__estado proyecto-card__estado--${proyecto.estado} form-page__banner-estado`}>
            {ESTADO_LABEL[proyecto.estado] ?? proyecto.estado}
          </span>
        </div>
        {proyecto.rutas?.nombre && (
          <img
            src={ICONOS_RUTA[proyecto.rutas.nombre]}
            alt={proyecto.rutas.nombre}
            className="form-page__banner-icon"
          />
        )}
      </div>

      {/* Acciones */}
      <div className="form-page__header">
        {!editando ? (
          <div className="form-page__header-actions">
            <button className="form-page__btn-delete" onClick={() => setConfirmarEliminar(true)}>
              <img src={iconDelete} alt="" className="btn-icon" /> Eliminar
            </button>
            <button className="form-page__btn-edit" onClick={() => setEditando(true)}>
              <img src={iconEdit} alt="" className="btn-icon" /> Editar
            </button>
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

      {/* Formulario */}
      <div className="form-page__body">

        {/* ── Sección Anteproyecto ── */}
        <div className="form-page__seccion-label">Anteproyecto</div>

        <Campo label="Motivación">
          {editando
            ? <textarea value={form.motivacion} onChange={(e) => setField('motivacion', e.target.value)} />
            : <Valor texto={form.motivacion} />}
        </Campo>

        <Campo label="Objetivo general">
          {editando
            ? <textarea value={form.objetivo_general} onChange={(e) => setField('objetivo_general', e.target.value)} />
            : <Valor texto={form.objetivo_general} />}
        </Campo>

        <Campo label="Objetivos específicos">
          {editando
            ? <ListaEditable items={form.obj_particulares} onChange={(v) => setField('obj_particulares', v)} />
            : <ListaVista items={form.obj_particulares} />}
        </Campo>

        <Campo label="ODS">
          <div className="ods-grid">
            {ODS.map(({ num, nombre, color, emoji }) => {
              const seleccionado = form.ods?.includes(num)
              return (
                <div
                  key={num}
                  className={`ods-card ${seleccionado ? 'ods-card--seleccionado' : ''} ${!editando && !seleccionado ? 'ods-card--oculto' : ''}`}
                  style={{ '--ods-color': color }}
                  onClick={() => editando && toggleOds(num)}
                  title={`${num}. ${nombre}`}
                >
                  <span className="ods-card__num">{num}</span>
                  <span className="ods-card__emoji">{emoji}</span>
                  <span className="ods-card__nombre">{nombre}</span>
                </div>
              )
            })}
            {!editando && (form.ods ?? []).length === 0 && (
              <span className="form-page__vacio">—</span>
            )}
          </div>
        </Campo>

        <Campo label="Objetivos educativos">
          <ObjetivosAcordeon
            rutaId={proyecto.ruta_id}
            seleccionados={objetivosSeleccionados}
            completados={objetivosCompletados}
            onChange={setObjetivosSeleccionados}
            editando={editando}
          />
        </Campo>

        {/* ── Sección Proyecto ── */}
        <div className="form-page__seccion-label">Proyecto</div>

        <Campo label="Descripción">
          {editando
            ? <textarea value={form.descripcion} onChange={(e) => setField('descripcion', e.target.value)} />
            : <Valor texto={form.descripcion} />}
        </Campo>

        <Campo label="Acciones">
          {editando
            ? <ListaEditable items={form.acciones} onChange={(v) => setField('acciones', v)} />
            : <ListaVista items={form.acciones} />}
        </Campo>

        <Campo label="Lugar">
          {editando
            ? <input type="text" value={form.lugar} onChange={(e) => setField('lugar', e.target.value)} />
            : <Valor texto={form.lugar} />}
        </Campo>

        <Campo label="Involucrados">
          {editando
            ? <ListaEditable items={form.involucrados} onChange={(v) => setField('involucrados', v)} />
            : <ListaVista items={form.involucrados} />}
        </Campo>

        <Campo label="Recursos">
          {editando
            ? <ListaEditable items={form.recursos} onChange={(v) => setField('recursos', v)} />
            : <ListaVista items={form.recursos} />}
        </Campo>

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

        <Campo label="Aprendizajes">
          {editando
            ? <textarea value={form.aprendizajes} onChange={(e) => setField('aprendizajes', e.target.value)} />
            : <Valor texto={form.aprendizajes} />}
        </Campo>

      </div>

      {/* Modal confirmación eliminar */}
      {confirmarEliminar && (
        <div className="modal-overlay" onClick={() => setConfirmarEliminar(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal__title">Eliminar proyecto</h2>
            <p style={{ color: '#a6adc8', fontSize: '0.9rem' }}>
              ¿Estás seguro de que querés eliminar <strong style={{ color: '#cdd6f4' }}>{proyecto.nombre}</strong>?
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

// Genera un gradiente izquierda clara → derecha oscura a partir de un color hex
function rutaGradiente(hex) {
  const n = parseInt((hex ?? '#2196F3').replace('#', ''), 16)
  const adj = (v, d) => Math.min(255, Math.max(0, v + d))
  const r = n >> 16, g = (n >> 8) & 0xff, b = n & 0xff
  const claro  = `rgb(${adj(r, 55)}, ${adj(g, 55)}, ${adj(b, 55)})`
  const oscuro = `rgb(${adj(r,-45)}, ${adj(g,-45)}, ${adj(b,-45)})`
  return `linear-gradient(to right, ${claro}, ${oscuro})`
}

// Helpers de presentación
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

function ListaVista({ items = [] }) {
  if (!items.length) return <span className="form-page__vacio">—</span>
  return (
    <ul className="lista-vista">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  )
}

export default ProyectoFormPage
