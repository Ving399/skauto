import { useMemo } from 'react'

const W       = 800
const H       = 100
const PAD_X   = 72
const NODE_R  = 11
const PEAK_Y  = 50
const BASE_Y  = 84

// Convierte una lista de puntos a una curva cúbica suave (Catmull-Rom → Bezier)
function smoothPath(pts) {
  if (pts.length === 0) return ''
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`

  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = i > 0 ? pts[i - 1] : pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = i < pts.length - 2 ? pts[i + 2] : pts[i + 1]

    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6

    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`
  }
  return d
}

export default function TrailSVG({ objetivos, estadoObjetivo, color }) {
  const N = objetivos.length

  const nodes = useMemo(() => {
    return objetivos.map((obj, i) => {
      const t = N <= 1 ? 0.5 : i / (N - 1)
      const x = PAD_X + t * (W - 2 * PAD_X)
      const y = BASE_Y - (BASE_Y - PEAK_Y) * Math.sin(Math.PI * t)
      return { x, y, obj }
    })
  }, [objetivos, N])

  if (N === 0) return null

  const pts    = nodes.map(n => ({ x: n.x, y: n.y }))
  const pathD  = smoothPath(pts)
  const first  = nodes[0]
  const last   = nodes[N - 1]
  const areaD  = `${pathD} L ${last.x},${H} L ${first.x},${H} Z`

  const primerPendienteIdx = nodes.findIndex(
    n => estadoObjetivo(n.obj.id) !== 'completado'
  )

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ display: 'block', overflow: 'visible' }}
    >
      {/* Área sombreada bajo el sendero */}
      <path d={areaD} fill={color} opacity={0.10} />

      {/* Línea del sendero */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Nodos */}
      {nodes.map(({ x, y, obj }, i) => {
        const estado     = estadoObjetivo(obj.id)
        const completado = estado === 'completado'
        const enProgreso = estado === 'en_progreso'
        const conBandera = i === primerPendienteIdx

        // Posiciones de la bandera
        const poleBot = y - NODE_R - 3
        const poleTop = y - NODE_R - 26
        const flagMid = poleTop + 6
        const flagBot = poleTop + 13

        return (
          <g key={obj.id}>
            {/* Bandera sobre el primer nodo pendiente */}
            {conBandera && (
              <>
                <line
                  x1={x} y1={poleBot}
                  x2={x} y2={poleTop}
                  stroke={color}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
                <polygon
                  points={`${x},${poleTop} ${x + 13},${flagMid} ${x},${flagBot}`}
                  fill={color}
                />
              </>
            )}

            {/* Fondo blanco para enmascarar la línea */}
            <circle cx={x} cy={y} r={NODE_R} fill="white" />

            {/* Círculo del nodo */}
            {completado ? (
              <circle cx={x} cy={y} r={NODE_R} fill={color} />
            ) : enProgreso ? (
              <circle
                cx={x} cy={y} r={NODE_R}
                fill="white"
                stroke={color}
                strokeWidth={2}
                strokeDasharray="4 2.5"
              />
            ) : (
              <circle
                cx={x} cy={y} r={NODE_R}
                fill={color}
                fillOpacity={0.2}
                stroke={color}
                strokeWidth={1.5}
                strokeOpacity={0.4}
              />
            )}

            {/* Contenido del nodo */}
            {completado ? (
              <text
                x={x} y={y + 5}
                textAnchor="middle"
                fill="white"
                fontSize={14}
                fontWeight="700"
                fontFamily="sans-serif"
              >
                ✓
              </text>
            ) : (
              <text
                x={x} y={y + 4.5}
                textAnchor="middle"
                fill={color}
                fillOpacity={enProgreso ? 1 : 0.5}
                fontSize={11}
                fontWeight="700"
                fontFamily="sans-serif"
              >
                {obj.numero}
              </text>
            )}

          </g>
        )
      })}
    </svg>
  )
}
