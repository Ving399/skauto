// src/components/SideBarItem.jsx
//SideBarItem — solo cambia la URL y se pinta como activo o inactivo. 
// No renderiza ninguna página. Su único trabajo es ser un link inteligente que sabe si está seleccionado.
import { NavLink } from 'react-router-dom'

// label: texto visible, to: ruta, icon: emoji o componente
function SideBarItem({ label, to, icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => 'sidebar-item' + (isActive ? ' sidebar-item--active' : '')}
    >
      <span className="sidebar-item__icon">{icon}</span>
      <span className="sidebar-item__label">{label}</span>
    </NavLink>
  )
}

export default SideBarItem
