// src/pages/Landing.jsx

// NUEVO: importamos useState y useEffect para manejar los datos del backend
import { useState, useEffect } from 'react'

// NUEVO: importamos apiFetch para llamar al backend con el JWT automático
import { apiFetch } from '../utils/apiFetch'

// supabase lo mantenemos solo para el logout
import { supabase } from '../supabaseClient'

function Landing({ session }) {

  // NUEVO: estado para guardar los datos que responde el backend
  const [userData, setUserData] = useState(null)

  // NUEVO: al cargar el componente, llamamos al backend en GET /api/me
  useEffect(() => {
    apiFetch('/api/me').then((data) => {
      setUserData(data)
    })
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <div>
      <h1>Bienvenido</h1>

      {/* NUEVO: mostramos los datos que vienen del backend */}
      {/* Mientras carga, mostramos "Cargando..." */}
      {userData ? (
        <>
          {/* ANTES venía de session.user.user_metadata.full_name (directo de Supabase) */}
          {/* AHORA viene de /api/me a través del backend */}
          <p>{userData.nombre}</p>
          <p>{userData.email}</p>
        </>
      ) : (
        <p>Cargando...</p>
      )}

      <button onClick={handleLogout}>
        Cerrar sesión
      </button>
    </div>
  )
}

export default Landing
