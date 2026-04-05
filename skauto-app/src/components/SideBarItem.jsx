// src/components/SideBarItem.jsx
import { NavLink } from 'react-router-dom'

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
