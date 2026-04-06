// src/layouts/MainLayouts.jsx
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import logoChico from '../assets/icons/logo-chico.svg'

function MainLayouts({ session }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="main-layout">

      {/* Botón para abrir sidebar en mobile */}
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(true)}
        aria-label="Abrir menú"
      >
        <img src={logoChico} alt="SKAuto" />
      </button>

      {/* Overlay oscuro al abrir en mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar session={session} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="main-layout__content">
        <Outlet />
      </main>

    </div>
  )
}

export default MainLayouts
