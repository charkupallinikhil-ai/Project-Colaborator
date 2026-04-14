import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../api';

function StatCard({ label, value, icon, color }) {
  return (
    <article className="stat-card" style={{ borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: '1.6rem', marginBottom: '0.35rem' }}>{icon}</div>
      <p className="stat-value">{value}</p>
      <p className="stat-label">{label}</p>
    </article>
  );
}

function Dashboard({ user }) {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const isLeaderOrTeacher = user.role === 'Leader' || user.role === 'Teacher';

  useEffect(() => {
    let canceled = false;
    async function load() {
      try {
        const [pRes, tRes] = await Promise.all([
          api.get('/projects'),
          api.get('/tasks'),
        ]);
        if (canceled) return;
        setProjects(pRes.data);
        setTasks(tRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (!canceled) setLoading(false);
      }
    }
    load();
    return () => { canceled = true; };
  }, []);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <span>Loading dashboard…</span>
      </div>
    );
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;
  const pendingTasks = tasks.filter((t) => t.status === 'Pending').length;
  const myTasks = tasks.filter((t) => t.assignedTo?._id === user.id);
  const myCompleted = myTasks.filter((t) => t.status === 'Done').length;
  const myContrib = myTasks.length > 0 ? Math.round((myCompleted / myTasks.length) * 100) : 0;

  const recentTasks = [...tasks].slice(0, 5);
  const recentProjects = [...projects].slice(0, 4);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Welcome back, <strong>{user.name}</strong> 👋</p>
        </div>
        {isLeaderOrTeacher && (
          <div className="flex-row">
            <NavLink to="/projects/create" className="button">+ New Project</NavLink>
            <NavLink to="/tasks" className="button button-secondary">+ Assign Task</NavLink>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {isLeaderOrTeacher && (
          <StatCard label="Projects" value={projects.length} icon="📁" color="#7c9ef8" />
        )}
        <StatCard label="Total Tasks" value={totalTasks} icon="✅" color="#b89cf8" />
        <StatCard label="Completed" value={completedTasks} icon="🏆" color="#4caf88" />
        <StatCard label="In Progress" value={inProgressTasks} icon="⚡" color="#e8a04a" />
        <StatCard label="Pending" value={pendingTasks} icon="🕐" color="#e87070" />
        {user.role === 'Student' && (
          <StatCard label="My Contribution" value={`${myContrib}%`} icon="📊" color="#7c9ef8" />
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {/* Recent Tasks */}
        <div className="section-card">
          <div className="section-head">
            <div>
              <h2>{user.role === 'Student' ? 'My Tasks' : 'Recent Tasks'}</h2>
              <p>{user.role === 'Student' ? 'Your assigned tasks' : 'Latest task activity'}</p>
            </div>
            <NavLink to="/tasks" className="button button-sm button-outline">View All</NavLink>
          </div>
          {recentTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <p>No tasks found</p>
            </div>
          ) : (
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {recentTasks.map((task) => {
                const badgeClass =
                  task.status === 'Done' ? 'badge badge-done' :
                  task.status === 'In Progress' ? 'badge badge-progress' : 'badge badge-pending';
                return (
                  <li key={task._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>{task.title}</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--txt-muted)' }}>
                        {task.assignedTo?.name} · {task.projectId?.name}
                      </p>
                    </div>
                    <span className={badgeClass}>{task.status}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Projects / My Progress */}
        {isLeaderOrTeacher ? (
          <div className="section-card">
            <div className="section-head">
              <div>
                <h2>Your Projects</h2>
                <p>Projects you manage</p>
              </div>
              <NavLink to="/projects" className="button button-sm button-outline">View All</NavLink>
            </div>
            {recentProjects.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📂</div>
                <p>No projects yet. <NavLink to="/projects/create">Create one!</NavLink></p>
              </div>
            ) : (
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recentProjects.map((p) => (
                  <li key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>{p.name}</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--txt-muted)' }}>
                        {p.members?.length || 0} members
                      </p>
                    </div>
                    <NavLink to={`/projects/${p._id}`} className="button button-sm button-ghost">View</NavLink>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="section-card">
            <div className="section-head">
              <div><h2>My Contribution</h2><p>Your overall progress</p></div>
            </div>
            <div style={{ padding: '1rem 0' }}>
              <div className="progress-header">
                <span style={{ fontWeight: 600 }}>Completed Tasks</span>
                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{myContrib}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${myContrib}%` }} />
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--txt-muted)', marginTop: '0.75rem' }}>
                {myCompleted} of {myTasks.length} tasks completed
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions for Leader/Teacher */}
      {isLeaderOrTeacher && (
        <div className="section-card" style={{ marginTop: '1.25rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Quick Actions</h2>
          <div className="flex-row">
            <NavLink to="/projects/create" className="button">📁 Create Project</NavLink>
            <NavLink to="/tasks" className="button button-secondary">✅ Manage Tasks</NavLink>
            <NavLink to="/contributions" className="button button-outline">📊 View Contributions</NavLink>
            {user.role === 'Teacher' && (
              <NavLink to="/reports" className="button button-ghost">📋 Generate Reports</NavLink>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
