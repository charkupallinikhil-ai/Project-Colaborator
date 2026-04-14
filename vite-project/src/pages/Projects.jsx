import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../api';

function Projects({ user }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [copiedCode, setCopiedCode] = useState('');
  const isLeaderOrTeacher = user.role === 'Leader' || user.role === 'Teacher';

  useEffect(() => {
    let canceled = false;
    api.get('/projects')
      .then((res) => { if (!canceled) setProjects(res.data); })
      .catch((err) => { if (!canceled) setError(err.response?.data?.message || 'Failed to load projects'); })
      .finally(() => { if (!canceled) setLoading(false); });
    return () => { canceled = true; };
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="loading-state"><div className="spinner" /><span>Loading projects…</span></div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p className="page-subtitle">
            {isLeaderOrTeacher ? 'Manage your classroom projects' : 'Projects you are enrolled in'}
          </p>
        </div>
        <div className="flex-row">
          {user.role === 'Student' && (
            <NavLink to="/join" className="button button-secondary" id="join-project-btn">
              🔑 Join with Code
            </NavLink>
          )}
          {isLeaderOrTeacher && (
            <NavLink to="/projects/create" className="button" id="create-project-btn">
              + New Project
            </NavLink>
          )}
        </div>
      </div>

      {error && <div className="error-box" style={{ marginBottom: '1rem' }}>⚠️ {error}</div>}

      {/* Search */}
      <div className="section-card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.25rem' }}>
        <input
          id="project-search"
          type="text"
          placeholder="🔍  Search projects…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.9rem', background: 'transparent', color: 'var(--txt-base)' }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📂</div>
          <p style={{ fontWeight: 600, marginBottom: '0.4rem' }}>No projects found</p>
          {isLeaderOrTeacher
            ? <p>Get started by <NavLink to="/projects/create">creating a project</NavLink></p>
            : <p>Use a <NavLink to="/join">join code</NavLink> from your Teacher or Leader to join a project.</p>
          }
        </div>
      ) : (
        <div className="grid-2">
          {filtered.map((project) => (
            <div key={project._id} className="project-card" style={{ cursor: 'default' }}>
              {/* Header */}
              <div className="flex-between">
                <p className="project-card-title">📁 {project.name}</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--txt-muted)', background: 'var(--bg-main)', borderRadius: '99px', padding: '0.15rem 0.6rem' }}>
                  {project.members?.length || 0} members
                </span>
              </div>

              <p className="project-card-desc">{project.description || 'No description.'}</p>

              {/* Join Code — only visible to Leader/Teacher */}
              {isLeaderOrTeacher && project.joinCode && (
                <div style={{
                  background: 'var(--pastel-mint)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.5rem 0.85rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: '0.5rem',
                }}>
                  <div>
                    <p style={{ fontSize: '0.72rem', color: '#1a7a56', fontWeight: 600, marginBottom: '0.1rem' }}>
                      🔑 Join Code (share with students)
                    </p>
                    <p style={{ fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.2em', color: '#1a7a56' }}>
                      {project.joinCode}
                    </p>
                  </div>
                  <button
                    className="button button-sm"
                    style={{ background: '#1a7a56', color: 'white', flexShrink: 0 }}
                    onClick={() => copyCode(project.joinCode)}
                  >
                    {copiedCode === project.joinCode ? '✓ Copied!' : '📋 Copy'}
                  </button>
                </div>
              )}

              {/* Footer */}
              <div className="project-card-footer">
                <span>👑 {project.leader?.name || 'Unknown'}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--txt-light)' }}>
                  {new Date(project.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>

              {/* Members chips */}
              {project.members?.length > 0 && (
                <div className="member-chips">
                  {project.members.slice(0, 5).map((m) => (
                    <span key={m._id} className="member-chip">👤 {m.name}</span>
                  ))}
                  {project.members.length > 5 && (
                    <span className="member-chip">+{project.members.length - 5} more</span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex-row" style={{ marginTop: '0.25rem' }}>
                <NavLink to={`/projects/${project._id}`} className="button button-sm button-outline">
                  View Details
                </NavLink>
                {isLeaderOrTeacher && (
                  <button className="button button-sm button-danger" onClick={() => handleDelete(project._id)}>
                    🗑 Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Projects;
