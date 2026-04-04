// src/App.jsx
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import LoginPage from './pages/LoginPage'
import Landing from './pages/Landing'

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    // 1. Revisa si ya hay sesión al cargar la app
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    // 2. Escucha cambios de sesión en tiempo real
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    // 3. Limpia el listener cuando el componente se desmonta
    return () => listener.subscription.unsubscribe()
  }, [])

  // 4. Decide qué mostrar
  if (session) {
    return <Landing session={session} />
  }

  return <LoginPage />
}

export default App