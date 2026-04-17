// src/components/Sidebar.jsx
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import SideBarItem from './SideBarItem'
import logo from '../assets/imagenes/logo.png'
import iconRocket      from '../assets/icons/rocket.svg'
import iconAvance      from '../assets/icons/avance.svg'
import iconTool        from '../assets/icons/tool.svg'
import iconCompetencias from '../assets/icons/competencias.svg'
import iconAventuras   from '../assets/icons/fire.svg'

function Sidebar({ session, isOpen, onClose }) {
  const user = session.user
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <aside className={`sidebar${isOpen ? ' sidebar--open' : ''}`}>

      {/* Logo */}
      <div className="sidebar__logo">
        <img src={logo} alt="SKAuto" />
      </div>

      {/* Info del usuario */}
      <div className="sidebar__user" onClick={() => { navigate('/perfil'); onClose() }} style={{ cursor: 'pointer' }}>
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
        <SideBarItem to="/proyectos"    icon={<img src={iconRocket}       alt="" />} label="Proyectos"    onClick={onClose} />
        <SideBarItem to="/competencias" icon={<img src={iconCompetencias} alt="" />} label="Competencias" onClick={onClose} />
        <SideBarItem to="/aventuras"    icon={<img src={iconAventuras}    alt="" />} label="Aventuras"    onClick={onClose} />
        <SideBarItem to="/avance"       icon={<img src={iconAvance}       alt="" />} label="Avance"       onClick={onClose} />
        <SideBarItem to="/tools"        icon={<img src={iconTool}         alt="" />} label="Herramientas" onClick={onClose} />
      </nav>

      {/* Logout */}
      <button className="sidebar__logout" onClick={handleLogout}>
        Cerrar sesión
      </button>

    </aside>
  )
}

export default Sidebar
