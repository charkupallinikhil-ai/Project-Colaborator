import { useEffect, useState } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import api from '../api';

function ProjectDetails({ user }) {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const isLeaderOrTeacher = user.role === 'Leader' || user.role === 'Teacher';

  useEffect(() => {
    let canceled = false;
    async function load() {
      try {
        const [pRes, tRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get(`/tasks/project/${id}`),
        ]);
        if (canceled) return;
        setProject(pRes.data);
        setTasks(tRes.data);
      } catch (err) {
        if (!canceled) setError('Failed to load project details');
      } finally {
        if (!canceled) setLoading(false);
      }
    }
    load();
    return () => { canceled = true; };
  }, [id]);

  if (loading) {
    return <div className="loading-state"><div className="spinner" /><span>Loading project…</span></div>;
  }

  if (error || !project) {
    return <div className="error-box" style={{ marginTop: '2rem' }}>⚠️ {error || 'Project not found'}</div>;
  }

  const filteredTasks = filterStatus ? tasks.filter((t) => t.status === filterStatus) : tasks;
  const done     = tasks.filter((t) => t.status === 'Done').length;
  const inProg   = tasks.filter((t) => t.status === 'In Progress').length;
  const progress = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ fontSize: '0.83rem', color: 'var(--txt-muted)', marginBottom: '1rem' }}>
        <NavLink to="/projects" style={{ color: 'var(--accent)' }}>Projects</NavLink>
        <span style={{ margin: '0 0.4rem' }}>›</span>
        {project.name}
      </div>

      <div className="page-header">
        <div>
          <h1>📁 {project.name}</h1>
          <p className="page-subtitle">{project.description}</p>
        </div>
        {isLeaderOrTeacher && (
          <NavLink to="/tasks" className="button button-secondary">+ Assign Task</NavLink>
        )}
      </div>

      {/* Project Info + Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Info */}
        <div className="section-card">
          <h2 style={{ marginBottom: '0.85rem' }}>Project Info</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.9rem' }}>
            <div className="flex-row">
              <span style={{ color: 'var(--txt-muted)', minWidth: '80px' }}>Leader:</span>
              <span className="badge badge-leader">👑 {project.leader?.name}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--txt-muted)', minWidth: '80px', paddingTop: '0.2rem' }}>Members:</span>
              <div className="member-chips">
                {project.members?.length > 0
                  ? project.members.map((m) => (
                      <span key={m._id} className="member-chip">👤 {m.name}</span>
                    ))
                  : <span style={{ color: 'var(--txt-muted)', fontSize: '0.85rem' }}>No members yet</span>
                }
              </div>
            </div>
            <div className="flex-row">
              <span style={{ color: 'var(--txt-muted)', minWidth: '80px' }}>Created:</span>
              <span>{new Date(project.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="section-card">
          <h2 style={{ marginBottom: '0.85rem' }}>Task Progress</h2>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '1rem' }}>
            <article className="stat-card" style={{ borderTop: '3px solid #4caf88' }}>
              <p className="stat-value" style={{ fontSize: '1.5rem' }}>{done}</p>
              <p className="stat-label">Done</p>
            </article>
            <article className="stat-card" style={{ borderTop: '3px solid #e8a04a' }}>
              <p className="stat-value" style={{ fontSize: '1.5rem' }}>{inProg}</p>
              <p className="stat-label">In Progress</p>
            </article>
            <article className="stat-card" style={{ borderTop: '3px solid #94a3b8' }}>
              <p className="stat-value" style={{ fontSize: '1.5rem' }}>{tasks.length - done - inProg}</p>
              <p className="stat-label">Pending</p>
            </article>
          </div>
          <div className="progress-header">
            <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Completion</span>
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{progress}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="section-card">
        <div className="flex-between" style={{ marginBottom: '1rem' }}>
          <h2>Tasks ({filteredTasks.length})</h2>
          <div className="filter-bar" style={{ margin: 0 }}>
            <select
              id="project-detail-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p>No tasks {filterStatus ? `with status "${filterStatus}"` : 'in this project'} yet.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th>Deadline</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((t) => {
                  const isOverdue = t.deadline && t.status !== 'Done' && new Date(t.deadline) < new Date();
                  const badgeCls = t.status === 'Done' ? 'badge badge-done' : t.status === 'In Progress' ? 'badge badge-progress' : 'badge badge-pending';
                  return (
                    <tr key={t._id}>
                      <td>
                        <p style={{ fontWeight: 600 }}>{t.title}</p>
                        {t.description && <p style={{ fontSize: '0.78rem', color: 'var(--txt-muted)' }}>{t.description}</p>}
                      </td>
                      <td>
                        <span className="member-chip">👤 {t.assignedTo?.name || '—'}</span>
                      </td>
                      <td><span className={badgeCls}>{t.status}</span></td>
                      <td style={isOverdue ? { color: 'var(--danger)', fontWeight: 600 } : { color: 'var(--txt-muted)' }}>
                        {t.deadline
                          ? new Date(t.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                          : '—'}
                        {isOverdue && ' ⚠️'}
                      </td>
                      <td>⭐ {t.points}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectDetails;
