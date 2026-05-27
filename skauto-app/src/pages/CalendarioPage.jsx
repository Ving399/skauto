// src/pages/CalendarioPage.jsx
import { useState, useEffect, useMemo } from 'react'
import { apiFetch } from '../utils/apiFetch'

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
]
const DIAS = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']

function formatHorario(h) {
  if (!h) return null
  // Convierte "10:00 - 14:00" a "10:00 - 14:00" (ya está en formato legible)
  return h
}

export default function CalendarioPage() {
  const hoy = new Date()
  const [year, setYear]   = useState(hoy.getFullYear())
  const [month, setMonth] = useState(hoy.getMonth() + 1)
  const [actividades, setActividades] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    setCargando(true)
    apiFetch(`/api/calendario?year=${year}&month=${month}`).then(data => {
      setActividades(Array.isArray(data) ? data : [])
      setCargando(false)
    })
  }, [year, month])

  function prevMes() {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  function nextMes() {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  // Mapa fecha → actividades
  const actPorDia = useMemo(() => {
    const map = {}
    actividades.forEach(a => {
      const dia = parseInt(a.fecha.split('-')[2], 10)
      if (!map[dia]) map[dia] = []
      map[dia].push(a)
    })
    return map
  }, [actividades])

  // Celdas del grid
  const celdas = useMemo(() => {
    const primerDia = new Date(year, month - 1, 1).getDay() // 0=dom
    const offset    = (primerDia + 6) % 7                   // 0=lun
    const diasMes   = new Date(year, month, 0).getDate()
    const arr = []
    for (let i = 0; i < offset; i++) arr.push(null)
    for (let d = 1; d <= diasMes; d++) arr.push(d)
    return arr
  }, [year, month])

  const esHoy = (dia) =>
    dia === hoy.getDate() &&
    month === hoy.getMonth() + 1 &&
    year  === hoy.getFullYear()

  return (
    <div className="cal-page">

      <div className="cal-page__header">
        <h1 className="cal-page__titulo">Calendario del clan</h1>
        <div className="cal-nav">
          <button className="cal-nav__btn" onClick={prevMes}>‹</button>
          <span className="cal-nav__label">{MESES[month - 1]} {year}</span>
          <button className="cal-nav__btn" onClick={nextMes}>›</button>
        </div>
      </div>

      <div className="cal-grid">
        {DIAS.map(d => (
          <div key={d} className="cal-grid__header-cell">{d}</div>
        ))}

        {cargando
          ? Array.from({ length: 35 }, (_, i) => (
              <div key={i} className="cal-grid__cell cal-grid__cell--loading" />
            ))
          : celdas.map((dia, i) => (
              <div
                key={i}
                className={[
                  'cal-grid__cell',
                  !dia                              ? 'cal-grid__cell--vacia'      : '',
                  dia && esHoy(dia)                 ? 'cal-grid__cell--hoy'        : '',
                  dia && actPorDia[dia]?.length > 0 ? 'cal-grid__cell--con-eventos': '',
                ].join(' ')}
              >
                {dia && (
                  <>
                    <span className="cal-grid__dia">{dia}</span>
                    <div className="cal-grid__eventos">
                      {(actPorDia[dia] ?? []).map(a => (
                        <div key={a.id} className="cal-evento" title={`${a.proyecto_nombre} · ${a.titulo}`}>
                          <span className="cal-evento__titulo">{a.titulo}</span>
                          {a.horario && <span className="cal-evento__horario">{formatHorario(a.horario)}</span>}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))
        }
      </div>

    </div>
  )
}
