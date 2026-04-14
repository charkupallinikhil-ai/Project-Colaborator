import { useEffect, useState } from 'react';
import api from '../api';

function Reports({ user }) {
  const [projects, setProjects] = useState([]);
  const [tasksByProject, setTasksByProject] = useState({});
  const [loading, setLoading] = useState(true);

  // Teacher-only page
  if (user.role === 'Student') {
    return (
      <div className="empty-state" style={{ marginTop: '4rem' }}>
        <div className="empty-state-icon">🚫</div>
        <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>Access Denied</p>
        <p>Only Leaders and Teachers can view reports.</p>
      </div>
    );
  }

  useEffect(() => {
    let canceled = false;
    async function load() {
      try {
        const pRes = await api.get('/projects');
        if (canceled) return;
        setProjects(pRes.data);

        // Load tasks per project
        const taskMap = {};
        await Promise.all(
          pRes.data.map(async (p) => {
            const tRes = await api.get(`/tasks/project/${p._id}`).catch(() => ({ data: [] }));
            taskMap[p._id] = tRes.data;
          })
        );
        if (!canceled) setTasksByProject(taskMap);
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
        <span>Generating reports…</span>
      </div>
    );
  }

  // Global summary
  const totalTasks = Object.values(tasksByProject).flat().length;
  const totalDone  = Object.values(tasksByProject).flat().filter((t) => t.status === 'Done').length;
  const totalInProg = Object.values(tasksByProject).flat().filter((t) => t.status === 'In Progress').length;
  const totalPending = Object.values(tasksByProject).flat().filter((t) => t.status === 'Pending').length;
  const overallCompletion = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Reports</h1>
          <p className="page-subtitle">Project performance & team analytics</p>
        </div>
      </div>

      {/* Global Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <article className="stat-card" style={{ borderTop: '3px solid #7c9ef8' }}>
          <div style={{ fontSize: '1.4rem', marginBottom: '0.3rem' }}>📁</div>
          <p className="stat-value">{projects.length}</p>
          <p className="stat-label">Total Projects</p>
        </article>
        <article className="stat-card" style={{ borderTop: '3px solid #b89cf8' }}>
          <div style={{ fontSize: '1.4rem', marginBottom: '0.3rem' }}>✅</div>
          <p className="stat-value">{totalTasks}</p>
          <p className="stat-label">Total Tasks</p>
        </article>
        <article className="stat-card" style={{ borderTop: '3px solid #4caf88' }}>
          <div style={{ fontSize: '1.4rem', marginBottom: '0.3rem' }}>🏆</div>
          <p className="stat-value">{totalDone}</p>
          <p className="stat-label">Completed</p>
        </article>
        <article className="stat-card" style={{ borderTop: '3px solid #e8a04a' }}>
          <div style={{ fontSize: '1.4rem', marginBottom: '0.3rem' }}>⚡</div>
          <p className="stat-value">{totalInProg}</p>
          <p className="stat-label">In Progress</p>
        </article>
        <article className="stat-card" style={{ borderTop: '3px solid #e87070' }}>
          <div style={{ fontSize: '1.4rem', marginBottom: '0.3rem' }}>🕐</div>
          <p className="stat-value">{totalPending}</p>
          <p className="stat-label">Pending</p>
        </article>
      </div>

      {/* Overall Completion */}
      <div className="section-card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Overall Completion Rate</h2>
        <div className="progress-header">
          <span style={{ fontWeight: 600 }}>Platform-wide progress</span>
          <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '1.1rem' }}>{overallCompletion}%</span>
        </div>
        <div className="progress-track" style={{ height: '14px' }}>
          <div className="progress-fill" style={{ width: `${overallCompletion}%` }} />
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--txt-muted)', marginTop: '0.65rem' }}>
          {totalDone} of {totalTasks} tasks completed across all projects
        </p>
      </div>

      {/* Per Project Reports */}
      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📂</div>
          <p>No projects to report on yet.</p>
        </div>
      ) : (
        projects.map((project) => {
          const tasks = tasksByProject[project._id] || [];
          const done  = tasks.filter((t) => t.status === 'Done').length;
          const inProg = tasks.filter((t) => t.status === 'In Progress').length;
          const pending = tasks.filter((t) => t.status === 'Pending').length;
          const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;

          // Contribution per member
          const memberContrib = {};
          tasks.forEach((t) => {
            const name = t.assignedTo?.name || 'Unknown';
            if (!memberContrib[name]) memberContrib[name] = { total: 0, done: 0 };
            memberContrib[name].total += 1;
            if (t.status === 'Done') memberContrib[name].done += 1;
          });

          return (
            <div key={project._id} className="report-card">
              <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                <div>
                  <h3>📁 {project.name}</h3>
                  <p style={{ fontSize: '0.83rem', color: 'var(--txt-muted)', marginTop: '0.15rem' }}>
                    Leader: {project.leader?.name} · {project.members?.length || 0} members
                  </p>
                </div>
                <span
                  style={{
                    background: pct === 100 ? 'var(--success-bg)' : 'var(--accent-light)',
                    color: pct === 100 ? 'var(--success)' : 'var(--accent-hover)',
                    borderRadius: '99px', padding: '0.3rem 0.85rem',
                    fontWeight: 700, fontSize: '0.9rem',
                  }}
                >
                  {pct}%
                </span>
              </div>

              <div className="report-stat-row" style={{ marginBottom: '0.85rem' }}>
                <span>Total: <strong>{tasks.length}</strong></span>
                <span style={{ color: 'var(--success)' }}>✓ Done: <strong>{done}</strong></span>
                <span style={{ color: 'var(--warning)' }}>⚡ In Progress: <strong>{inProg}</strong></span>
                <span style={{ color: 'var(--txt-muted)' }}>🕐 Pending: <strong>{pending}</strong></span>
              </div>

              <div className="progress-track" style={{ marginBottom: '1rem' }}>
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>

              {/* Member Breakdown */}
              {Object.keys(memberContrib).length > 0 && (
                <>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--txt-muted)', marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Member Contributions
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {Object.entries(memberContrib).map(([name, data]) => {
                      const memberPct = data.total > 0 ? Math.round((data.done / data.total) * 100) : 0;
                      return (
                        <div key={name}>
                          <div className="progress-header">
                            <span style={{ fontWeight: 500 }}>{name}</span>
                            <span style={{ color: 'var(--accent)', fontSize: '0.82rem' }}>
                              {data.done}/{data.total} tasks · {memberPct}%
                            </span>
                          </div>
                          <div className="progress-track" style={{ height: '8px' }}>
                            <div className="progress-fill" style={{ width: `${memberPct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {tasks.length === 0 && (
                <p style={{ fontSize: '0.85rem', color: 'var(--txt-muted)' }}>No tasks assigned to this project yet.</p>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default Reports;
