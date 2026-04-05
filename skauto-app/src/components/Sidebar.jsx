// src/components/Sidebar.jsx
//Sidebar.jsx es el contenedor y organizador del panel lateral. 
// Su trabajo es ensamblar todas las piezas del sidebar en un solo lugar.
import { supabase } from '../supabaseClient'
import SideBarItem from './SideBarItem'

// session: objeto de sesión de Supabase, contiene info del usuario
function Sidebar({ session }) {
  const user = session.user

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <aside className="sidebar">

      {/* Info del usuario */}
      <div className="sidebar__user">
        <div className="sidebar__avatar">
          {user.user_metadata?.avatar_url
            ? <img src={user.user_metadata.avatar_url} alt="avatar" />
            : <span>{user.email[0].toUpperCase()}</span>
          }
        </div>
        <div className="sidebar__user-info">
          <p className="sidebar__user-name">{user.user_metadata?.full_name ?? 'Usuario'}</p>
          <p className="sidebar__user-email">{user.email}</p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="sidebar__nav">
        <SideBarItem to="/proyectos" icon="📁" label="Proyectos" />
        <SideBarItem to="/avance"    icon="📊" label="Avance"    />
        <SideBarItem to="/tools"     icon="🛠️" label="Tools"     />
      </nav>

      {/* Logout al fondo */}
      <button className="sidebar__logout" onClick={handleLogout}>
        Cerrar sesión
      </button>

    </aside>
  )
}

export default Sidebar
