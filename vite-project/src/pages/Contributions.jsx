import { useEffect, useState } from 'react';
import api from '../api';

function Contributions({ user }) {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState('');
  const [data, setData] = useState(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  if (user.role === 'Student') {
    return (
      <div className="empty-state" style={{ marginTop: '4rem' }}>
        <div className="empty-state-icon">🚫</div>
        <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>Access Denied</p>
        <p>Only Leaders and Teachers can view team contributions.</p>
      </div>
    );
  }

  useEffect(() => {
    api.get('/projects')
      .then((res) => {
        setProjects(res.data);
        if (res.data.length > 0) setSelected(res.data[0]._id);
      })
      .catch(console.error)
      .finally(() => setLoadingProjects(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoadingData(true);
    setData(null);
    api.get(`/contribution/${selected}`)
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoadingData(false));
  }, [selected]);

  if (loadingProjects) {
    return (
      <div className="loading-state"><div className="spinner" /><span>Loading…</span></div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Contributions</h1>
          <p className="page-subtitle">Track team member performance per project</p>
        </div>
      </div>

      {/* Project Selector */}
      <div className="section-card" style={{ marginBottom: '1.5rem' }}>
        <label className="field">
          <span>Select Project</span>
          <select
            id="contribution-project-select"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">-- Choose a project --</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </label>
      </div>

      {loadingData && (
        <div className="loading-state"><div className="spinner" /><span>Loading contribution data…</span></div>
      )}

      {!loadingData && data && (
        <div className="section-card">
          <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
            <div>
              <h2>{data.project}</h2>
              <p style={{ color: 'var(--txt-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                Total points in project: <strong style={{ color: 'var(--txt-base)' }}>{data.totalPoints}</strong>
              </p>
            </div>
          </div>

          {data.contribution.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <p>No tasks assigned in this project yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {data.contribution
                .sort((a, b) => b.percent - a.percent)
                .map((item, idx) => (
                  <div key={item.name}>
                    <div className="progress-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span
                          style={{
                            background: idx === 0 ? 'var(--pastel-yellow)' : 'var(--pastel-blue)',
                            borderRadius: '99px',
                            width: '28px', height: '28px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.75rem', fontWeight: 700,
                            color: idx === 0 ? '#b45309' : 'var(--accent-hover)',
                            flexShrink: 0,
                          }}
                        >
                          {idx === 0 ? '🥇' : `#${idx + 1}`}
                        </span>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.name}</p>
                          <p style={{ fontSize: '0.78rem', color: 'var(--txt-muted)' }}>
                            {item.completedTasks} of {item.totalTasks} tasks completed · {item.completedPoints} pts
                          </p>
                        </div>
                      </div>
                      <span
                        style={{
                          fontWeight: 700, fontSize: '1rem',
                          color: item.percent >= 75 ? 'var(--success)' : item.percent >= 40 ? 'var(--warning)' : 'var(--danger)',
                        }}
                      >
                        {item.percent}%
                      </span>
                    </div>
                    <div className="progress-track" style={{ marginTop: '0.4rem', height: '12px' }}>
                      <div
                        className="progress-fill"
                        style={{
                          width: `${item.percent}%`,
                          background:
                            item.percent >= 75
                              ? 'linear-gradient(90deg, #4caf88, #6ee7b7)'
                              : item.percent >= 40
                              ? 'linear-gradient(90deg, #e8a04a, #fbbf24)'
                              : 'linear-gradient(90deg, #e87070, #fca5a5)',
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {!loadingData && !data && selected && (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <p>No contribution data found for this project.</p>
        </div>
      )}
    </div>
  );
}

export default Contributions;
