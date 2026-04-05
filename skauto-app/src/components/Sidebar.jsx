// src/components/Sidebar.jsx
import { supabase } from '../supabaseClient'
import SideBarItem from './SideBarItem'
import logo from '../assets/imagenes/logo.png'
import iconRocket from '../assets/icons/rocket.svg'
import iconAvance from '../assets/icons/avance.svg'
import iconTool   from '../assets/icons/tool.svg'

function Sidebar({ session }) {
  const user = session.user

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <aside className="sidebar">

      {/* Logo */}
      <div className="sidebar__logo">
        <img src={logo} alt="SKAuto" />
      </div>

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
        <SideBarItem to="/proyectos" icon={<img src={iconRocket} alt="" />} label="Proyectos"    />
        <SideBarItem to="/avance"    icon={<img src={iconAvance} alt="" />} label="Avance"       />
        <SideBarItem to="/tools"     icon={<img src={iconTool}   alt="" />} label="Herramientas" />
      </nav>

      {/* Logout */}
      <button className="sidebar__logout" onClick={handleLogout}>
        Cerrar sesión
      </button>

    </aside>
  )
}

export default Sidebar
