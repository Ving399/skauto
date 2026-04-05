// src/components/ListaEditable.jsx
// Componente reutilizable para campos que son arrays de texto
// Muestra los items con botón de eliminar y un input para agregar nuevos
import { useState } from 'react'

// items: array de strings actual
// onChange: función que recibe el nuevo array
function ListaEditable({ items = [], onChange }) {
  const [inputVal, setInputVal] = useState('')

  function agregar() {
    const val = inputVal.trim()
    if (!val) return
    onChange([...items, val])
    setInputVal('')
  }

  function eliminar(index) {
    onChange(items.filter((_, i) => i !== index))
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      agregar()
    }
  }

  return (
    <div className="lista-editable">
      <ul className="lista-editable__items">
        {items.map((item, i) => (
          <li key={i} className="lista-editable__item">
            <span>{item}</span>
            <button type="button" onClick={() => eliminar(i)}>×</button>
          </li>
        ))}
      </ul>
      <div className="lista-editable__input">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribí y presioná Enter o +"
        />
        <button type="button" onClick={agregar}>+</button>
      </div>
    </div>
  )
}

export default ListaEditable
