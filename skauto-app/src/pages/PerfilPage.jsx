// src/pages/PerfilPage.jsx
import { useState, useEffect } from 'react'
import { apiFetch } from '../utils/apiFetch'

function PerfilPage() {
  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    apiFetch('/api/me').then((data) => {
      setPerfil(data)
      setCargando(false)
    })
  }, [])

  if (cargando) return <p className="form-page__loading">Cargando perfil...</p>

  return (
    <div className="perfil-page">

      <div className="perfil-page__avatar">
        {perfil.avatar_url
          ? <img src={perfil.avatar_url} alt="avatar" />
          : <span>{perfil.nombre?.[0]?.toUpperCase()}</span>
        }
      </div>

      <h1 className="perfil-page__nombre">{perfil.nombre}</h1>
      <p className="perfil-page__email">{perfil.email}</p>

      <div className="perfil-page__badge perfil-page__badge--tipo">
        {perfil.tipo === 'scouter' ? 'Scouter' : 'Rover'}
      </div>

      <div className="perfil-page__info">
        <div className="perfil-page__campo">
          <span className="perfil-page__label">Grupo</span>
          <span className="perfil-page__valor">
            {perfil.grupo_numero
              ? `${perfil.grupo_numero} — ${perfil.grupo_nombre}`
              : '—'}
          </span>
        </div>
        <div className="perfil-page__campo">
          <span className="perfil-page__label">Clan</span>
          <span className="perfil-page__valor">{perfil.clan ?? '—'}</span>
        </div>
      </div>

    </div>
  )
}

export default PerfilPage
