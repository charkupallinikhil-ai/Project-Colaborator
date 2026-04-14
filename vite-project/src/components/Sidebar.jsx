import { NavLink } from 'react-router-dom';

// nav items with role visibility
const navItems = [
  { to: '/dashboard',     label: 'Dashboard',     icon: '🏠', roles: ['Student', 'Leader', 'Teacher'] },
  { to: '/projects',      label: 'Projects',       icon: '📁', roles: ['Student', 'Leader', 'Teacher'] },
  { to: '/join',          label: 'Join Project',   icon: '🔑', roles: ['Student'] },
  { to: '/projects/create', label: 'Create Project', icon: '➕', roles: ['Leader', 'Teacher'] },
  { to: '/tasks',         label: 'Tasks',          icon: '✅', roles: ['Student', 'Leader', 'Teacher'] },
  { to: '/contributions', label: 'Contributions',  icon: '📊', roles: ['Leader', 'Teacher'] },
  { to: '/reports',       label: 'Reports',        icon: '📋', roles: ['Leader', 'Teacher'] },
  { to: '/profile',       label: 'Profile',        icon: '👤', roles: ['Student', 'Leader', 'Teacher'] },
];

function Sidebar({ user }) {
  const visible = navItems.filter((item) => item.roles.includes(user?.role));

  return (
    <aside className="sidebar" aria-label="Sidebar navigation">
      <span className="sidebar-section-label">Menu</span>
      {visible.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/projects'} // prevent /projects matching /projects/create
          className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
        >
          <span className="icon">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </aside>
  );
}

export default Sidebar;
