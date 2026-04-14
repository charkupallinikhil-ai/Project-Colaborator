import { useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import './index.css';

import Navbar  from './components/Navbar';
import Sidebar from './components/Sidebar';

import Login          from './pages/Login';
import Register       from './pages/Register';
import Dashboard      from './pages/Dashboard';
import Projects       from './pages/Projects';
import CreateProject  from './pages/CreateProject';
import ProjectDetails from './pages/ProjectDetails';
import JoinProject    from './pages/JoinProject';
import Tasks          from './pages/Tasks';
import Contributions  from './pages/Contributions';
import Reports        from './pages/Reports';
import Profile        from './pages/Profile';

function AppLayout({ user, onLogout, children }) {
  return (
    <div className="app-shell">
      <Navbar user={user} onLogout={onLogout} />
      <div className="layout-grid">
        <Sidebar user={user} />
        <main className="content">{children}</main>
      </div>
    </div>
  );
}

function RequireAuth({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const navigate = useNavigate();

  const handleAuth = (userData) => setUser(userData);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <Routes>
      {/* Public */}
      <Route path="/login"    element={user ? <Navigate to="/dashboard" replace /> : <Login    onAuth={handleAuth} />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register onAuth={handleAuth} />} />

      {/* Protected */}
      <Route
        path="/*"
        element={
          <RequireAuth user={user}>
            <AppLayout user={user} onLogout={handleLogout}>
              <Routes>
                <Route index                   element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard"        element={<Dashboard      user={user} />} />
                <Route path="projects"         element={<Projects       user={user} />} />
                <Route path="projects/create"  element={<CreateProject  user={user} />} />
                <Route path="projects/:id"     element={<ProjectDetails user={user} />} />
                <Route path="join"             element={<JoinProject />} />
                <Route path="tasks"            element={<Tasks          user={user} />} />
                <Route path="contributions"    element={<Contributions  user={user} />} />
                <Route path="reports"          element={<Reports        user={user} />} />
                <Route path="profile"          element={<Profile        user={user} />} />
                <Route path="*"                element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </AppLayout>
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}
