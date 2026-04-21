// src/components/ChecklistEditable.jsx
import { useState } from 'react'

// items: [{ id, texto, completada }]
// onChange: (nuevosItems) => void
// editando: boolean — muestra controles de agregar/eliminar
function ChecklistEditable({ items = [], onChange, editando = false }) {
  const [inputVal, setInputVal] = useState('')

  function toggleCompletar(id) {
    onChange(items.map(t => t.id === id ? { ...t, completada: !t.completada } : t))
  }

  function agregar() {
    const texto = inputVal.trim()
    if (!texto) return
    const nueva = { id: `${Date.now()}-${Math.random()}`, texto, completada: false }
    onChange([...items, nueva])
    setInputVal('')
  }

  function eliminar(id) {
    onChange(items.filter(t => t.id !== id))
  }

  function editarTexto(id, texto) {
    onChange(items.map(t => t.id === id ? { ...t, texto } : t))
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') { e.preventDefault(); agregar() }
  }

  return (
    <div className="lista-editable">
      <ul className="lista-editable__items">
        {items.map((tarea) => (
          <li key={tarea.id} className={`lista-editable__item checklist-item ${tarea.completada ? 'checklist-item--completada' : ''}`}>
            <button
              type="button"
              className="checklist-item__check"
              onClick={() => toggleCompletar(tarea.id)}
              aria-label={tarea.completada ? 'Marcar como pendiente' : 'Marcar como completada'}
            >
              {tarea.completada ? '✓' : ''}
            </button>
            {editando
              ? <input
                  type="text"
                  value={tarea.texto}
                  onChange={(e) => editarTexto(tarea.id, e.target.value)}
                  className={`lista-editable__item-input ${tarea.completada ? 'checklist-item__texto--tachado' : ''}`}
                />
              : <span className={`checklist-item__texto ${tarea.completada ? 'checklist-item__texto--tachado' : ''}`}>
                  {tarea.texto}
                </span>
            }
            {editando && (
              <button type="button" onClick={() => eliminar(tarea.id)}>×</button>
            )}
          </li>
        ))}
      </ul>

      {editando && (
        <div className="lista-editable__input">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nueva tarea..."
          />
          <button type="button" onClick={agregar}>+</button>
        </div>
      )}

      {!editando && items.length === 0 && (
        <p className="form-page__vacio">No hay tareas todavía.</p>
      )}
    </div>
  )
}

export default ChecklistEditable
