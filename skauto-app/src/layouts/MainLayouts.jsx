// src/layouts/MainLayouts.jsx
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

// session se pasa desde App.jsx para que Sidebar muestre los datos del usuario
function MainLayouts({ session }) {
  return (
    <div className="main-layout">
      <Sidebar session={session} />
      <main className="main-layout__content">
        {/* Outlet renderiza la página activa según la ruta */}
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayouts
