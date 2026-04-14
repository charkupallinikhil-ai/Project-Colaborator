function Navbar({ user, onLogout }) {
  const roleBadgeClass = {
    Student: 'badge badge-student',
    Leader: 'badge badge-leader',
    Teacher: 'badge badge-teacher',
  }[user?.role] || 'badge';

  return (
    <header className="top-navbar" aria-label="Top navigation">
      <div className="navbar-brand">
        <div className="navbar-logo">SC</div>
        <div>
          <div className="navbar-title">Student Collaboration</div>
          <div className="navbar-subtitle">Project Management Platform</div>
        </div>
      </div>

      <div className="navbar-actions">
        {user && (
          <>
            <span className={roleBadgeClass}>{user.role}</span>
            <span className="welcome-chip">👋 {user.name}</span>
            <button className="button button-ghost button-sm" onClick={onLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;
