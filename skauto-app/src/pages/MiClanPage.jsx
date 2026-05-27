// src/pages/MiClanPage.jsx
import { useState, useEffect } from 'react'
import { apiFetch } from '../utils/apiFetch'

function MiClanPage() {
  const [miembros, setMiembros]     = useState([])
  const [clan, setClan]             = useState(null)
  const [esScouter, setEsScouter]   = useState(false)
  const [cargando, setCargando]     = useState(true)
  const [modalAbierto, setModalAbierto]       = useState(false)
  const [roverAQuitar, setRoverAQuitar]       = useState(null)

  useEffect(() => {
    Promise.all([
      apiFetch('/api/me'),
      apiFetch('/api/clan'),
    ]).then(([meData, clanData]) => {
      setClan(meData?.clan ?? null)
      setEsScouter(meData?.tipo === 'scouter')
      setMiembros(Array.isArray(clanData) ? clanData : [])
      setCargando(false)
    })
  }, [])

  function handleConfirmarQuitar() {
    apiFetch(`/api/clan/quitar/${roverAQuitar.id}`, { method: 'PATCH' }).then(() => {
      setMiembros(prev => prev.filter(m => m.id !== roverAQuitar.id))
      setRoverAQuitar(null)
    })
  }

  function handleRoverAgregado(rover) {
    setMiembros(prev => [...prev, rover])
    setModalAbierto(false)
  }

  const scouters = miembros.filter(m => m.tipo === 'scouter')
  const rovers   = miembros.filter(m => m.tipo === 'rover')

  function iniciales(nombre) {
    if (!nombre) return '?'
    return nombre.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
  }

  return (
    <div className="clan-page">

      <div className="clan-page__header">
        <div className="clan-page__header-left">
          <h1 className="clan-page__titulo">Mi Clan</h1>
          {clan && <span className="clan-page__nombre-clan">{clan}</span>}
        </div>
        {esScouter && !cargando && (
          <button className="btn-crear" onClick={() => setModalAbierto(true)}>
            + Agregar rover
          </button>
        )}
      </div>

      {cargando ? (
        <p className="proyectos-page__empty">Cargando...</p>
      ) : miembros.length === 0 ? (
        <p className="proyectos-page__empty">No hay miembros en tu clan todavía.</p>
      ) : (
        <div className="clan-page__body">

          {scouters.length > 0 && (
            <section className="clan-seccion">
              <h2 className="clan-seccion__titulo">Scouters</h2>
              <ul className="clan-lista">
                {scouters.map(m => (
                  <li key={m.id} className="clan-miembro">
                    <div className="clan-miembro__avatar clan-miembro__avatar--scouter">
                      {iniciales(m.nombre)}
                    </div>
                    <div className="clan-miembro__info">
                      <p className="clan-miembro__nombre">{m.nombre}</p>
                      <p className="clan-miembro__email">{m.email}</p>
                    </div>
                    <span className="clan-miembro__badge clan-miembro__badge--scouter">Scouter</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {rovers.length > 0 && (
            <section className="clan-seccion">
              <h2 className="clan-seccion__titulo">Rovers</h2>
              <ul className="clan-lista">
                {rovers.map(m => (
                  <li key={m.id} className="clan-miembro">
                    <div className="clan-miembro__avatar clan-miembro__avatar--rover">
                      {iniciales(m.nombre)}
                    </div>
                    <div className="clan-miembro__info">
                      <p className="clan-miembro__nombre">{m.nombre}</p>
                      <p className="clan-miembro__email">{m.email}</p>
                    </div>
                    <span className="clan-miembro__badge clan-miembro__badge--rover">Rover</span>
                    {esScouter && (
                      <button
                        className="clan-miembro__btn-quitar"
                        onClick={() => setRoverAQuitar(m)}
                        title="Quitar del clan"
                      >
                        ×
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

        </div>
      )}

      {modalAbierto && (
        <ModalAgregarRover
          onRoverAgregado={handleRoverAgregado}
          onCerrar={() => setModalAbierto(false)}
        />
      )}

      {roverAQuitar && (
        <div className="modal-overlay" onClick={() => setRoverAQuitar(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <p className="modal__title">¿Quitar a {roverAQuitar.nombre} del clan?</p>
            <p style={{ fontSize: '0.88rem', color: '#888' }}>
              El rover perderá su vínculo con este clan.
            </p>
            <div className="modal__actions">
              <button className="modal__btn modal__btn--cancel" onClick={() => setRoverAQuitar(null)}>
                Cancelar
              </button>
              <button className="modal__btn modal__btn--delete" onClick={handleConfirmarQuitar}>
                Quitar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

function ModalAgregarRover({ onRoverAgregado, onCerrar }) {
  const [busqueda, setBusqueda]     = useState('')
  const [resultados, setResultados] = useState([])
  const [buscando, setBuscando]     = useState(false)
  const [agregando, setAgregando]   = useState(null)

  useEffect(() => {
    if (!busqueda.trim()) { setResultados([]); return }
    const timer = setTimeout(() => {
      setBuscando(true)
      apiFetch(`/api/clan/buscar?q=${encodeURIComponent(busqueda)}`)
        .then(data => {
          setResultados(Array.isArray(data) ? data : [])
          setBuscando(false)
        })
    }, 300)
    return () => clearTimeout(timer)
  }, [busqueda])

  function handleAgregar(rover) {
    setAgregando(rover.id)
    apiFetch('/api/clan/agregar', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rover_id: rover.id }),
    }).then(data => {
      onRoverAgregado({ ...rover, tipo: 'rover', ...data })
    }).finally(() => setAgregando(null))
  }

  function iniciales(nombre) {
    if (!nombre) return '?'
    return nombre.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
  }

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="clan-modal" onClick={e => e.stopPropagation()}>

        <div className="clan-modal__header">
          <h2 className="clan-modal__titulo">Agregar rover al clan</h2>
          <button className="clan-modal__cerrar" onClick={onCerrar}>×</button>
        </div>

        <input
          className="clan-modal__input"
          type="text"
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          autoFocus
        />

        <div className="clan-modal__resultados">
          {buscando && <p className="clan-modal__estado">Buscando...</p>}
          {!buscando && busqueda && resultados.length === 0 && (
            <p className="clan-modal__estado">Sin resultados para "{busqueda}"</p>
          )}
          {!buscando && !busqueda && (
            <p className="clan-modal__estado">Escribe un nombre para buscar</p>
          )}
          {resultados.map(r => (
            <div key={r.id} className="clan-modal__opcion">
              <div className="clan-miembro__avatar clan-miembro__avatar--rover clan-modal__opcion-avatar">
                {iniciales(r.nombre)}
              </div>
              <div className="clan-miembro__info">
                <p className="clan-miembro__nombre">{r.nombre}</p>
                <p className="clan-miembro__email">{r.email}</p>
              </div>
              <button
                className="clan-modal__btn-agregar"
                onClick={() => handleAgregar(r)}
                disabled={agregando === r.id}
              >
                {agregando === r.id ? '...' : 'Agregar'}
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default MiClanPage
