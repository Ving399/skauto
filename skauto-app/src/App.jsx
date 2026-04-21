// src/App.jsx
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'

import MainLayouts from './layouts/MainLayouts'
import LoginPage from './pages/LoginPage'
import ProyectosPage from './pages/ProyectosPage'
import ProyectoFormPage from './pages/ProyectoFormPage'
import AvancePage from './pages/AvancePage'
import ToolsPage from './pages/ToolsPage'
import PerfilPage from './pages/PerfilPage'
import CompetenciasPage from './pages/CompetenciasPage'
import CompetenciaFormPage from './pages/CompetenciaFormPage'
import AventurasPage from './pages/AventurasPage'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  if (loading) return null

  return (
    //App.jsx — es quien lee la URL y decide qué página renderizar. Tiene el mapa completo de rutas.
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={
          session ? <Navigate to="/proyectos" replace /> : <LoginPage />
        } />

        {/* Rutas protegidas — todas dentro del layout */}
        <Route element={
          session ? <MainLayouts session={session} /> : <Navigate to="/login" replace />
        }>
          <Route path="/proyectos"                   element={<ProyectosPage />} />
          <Route path="/proyectos/:id/configurar"    element={<ProyectoFormPage />} />
          <Route path="/avance"                      element={<AvancePage />} />
          <Route path="/competencias"                element={<CompetenciasPage />} />
          <Route path="/competencias/:id"            element={<CompetenciaFormPage />} />
          <Route path="/aventuras"                   element={<AventurasPage />} />
          <Route path="/tools"                       element={<ToolsPage />} />
          <Route path="/perfil"                      element={<PerfilPage />} />
        </Route>

        {/* Cualquier ruta desconocida redirige según sesión */}
        <Route path="*" element={
          <Navigate to={session ? '/proyectos' : '/login'} replace />
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App



