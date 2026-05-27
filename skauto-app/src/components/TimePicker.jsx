// src/components/TimePicker.jsx
import { useState, useEffect, useRef } from 'react'

const TIMES = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2)
  const m = i % 2 === 0 ? '00' : '30'
  const ampm = h < 12 ? 'AM' : 'PM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return { label: `${h12}:${m} ${ampm}`, value: `${String(h).padStart(2, '0')}:${m}` }
})

export default function TimePicker({ value, onChange, placeholder = 'HH:MM' }) {
  const [abierto, setAbierto] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const label = value
    ? TIMES.find(t => t.value === value)?.label ?? value
    : null

  return (
    <div className="timepicker" ref={ref}>
      <button
        type="button"
        className={`timepicker__input ${!label ? 'timepicker__input--placeholder' : ''}`}
        onClick={() => setAbierto(o => !o)}
      >
        {label ?? placeholder}
      </button>

      {abierto && (
        <div className="timepicker__dropdown">
          {TIMES.map(t => (
            <div
              key={t.value}
              className={`timepicker__option ${t.value === value ? 'timepicker__option--selected' : ''}`}
              onClick={() => { onChange(t.value); setAbierto(false) }}
            >
              {t.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
