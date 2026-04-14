import { useEffect, useState } from 'react';
import api from '../api';

function Profile({ user }) {
  const [tasks, setTasks]     = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/tasks'), api.get('/projects')])
      .then(([tRes, pRes]) => {
        setTasks(tRes.data);
        setProjects(pRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const myTasks     = tasks.filter((t) => t.assignedTo?._id === user.id || t.assignedTo?.id === user.id);
  const myDone      = myTasks.filter((t) => t.status === 'Done').length;
  const myInProg    = myTasks.filter((t) => t.status === 'In Progress').length;
  const myPending   = myTasks.filter((t) => t.status === 'Pending').length;
  const myContrib   = myTasks.length > 0 ? Math.round((myDone / myTasks.length) * 100) : 0;

  const roleBadgeClass = {
    Student: 'badge badge-student',
    Leader:  'badge badge-leader',
    Teacher: 'badge badge-teacher',
  }[user.role] || 'badge';

  const roleEmoji = { Student: '🎓', Leader: '🏆', Teacher: '👩‍🏫' }[user.role] || '👤';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Profile</h1>
          <p className="page-subtitle">Your account details and activity summary</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {/* Account Card */}
        <div className="section-card">
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), #b89cf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.8rem', margin: '0 auto 1rem',
              boxShadow: '0 4px 16px rgba(124,158,248,0.3)',
            }}>
              {roleEmoji}
            </div>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '0.35rem' }}>{user.name}</h2>
            <p style={{ color: 'var(--txt-muted)', fontSize: '0.88rem', marginBottom: '0.75rem' }}>{user.email}</p>
            <span className={roleBadgeClass} style={{ fontSize: '0.85rem', padding: '0.3rem 1rem' }}>
              {user.role}
            </span>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="section-card">
          <h2 style={{ marginBottom: '1rem' }}>Activity Summary</h2>
          {loading ? (
            <div className="loading-state"><div className="spinner" /></div>
          ) : (
            <>
              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '1.25rem' }}>
                <article className="stat-card" style={{ borderTop: '3px solid #4caf88' }}>
                  <p className="stat-value" style={{ fontSize: '1.4rem' }}>{myDone}</p>
                  <p className="stat-label">Done</p>
                </article>
                <article className="stat-card" style={{ borderTop: '3px solid #e8a04a' }}>
                  <p className="stat-value" style={{ fontSize: '1.4rem' }}>{myInProg}</p>
                  <p className="stat-label">In Progress</p>
                </article>
                <article className="stat-card" style={{ borderTop: '3px solid #94a3b8' }}>
                  <p className="stat-value" style={{ fontSize: '1.4rem' }}>{myPending}</p>
                  <p className="stat-label">Pending</p>
                </article>
              </div>

              <div className="progress-header">
                <span style={{ fontWeight: 600 }}>My Contribution</span>
                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{myContrib}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${myContrib}%` }} />
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--txt-muted)', marginTop: '0.6rem' }}>
                {myDone} of {myTasks.length} assigned tasks completed
              </p>

              {(user.role === 'Leader' || user.role === 'Teacher') && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '0.83rem', color: 'var(--txt-muted)' }}>
                    Projects managed: <strong style={{ color: 'var(--txt-base)' }}>{projects.length}</strong>
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Recent Tasks */}
        <div className="section-card">
          <h2 style={{ marginBottom: '1rem' }}>Recent Assigned Tasks</h2>
          {loading ? (
            <div className="loading-state"><div className="spinner" /></div>
          ) : myTasks.length === 0 ? (
            <div className="empty-state" style={{ padding: '1.5rem' }}>
              <div className="empty-state-icon">📭</div>
              <p>No tasks assigned yet</p>
            </div>
          ) : (
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {myTasks.slice(0, 6).map((t) => {
                const badgeCls = t.status === 'Done' ? 'badge badge-done' : t.status === 'In Progress' ? 'badge badge-progress' : 'badge badge-pending';
                return (
                  <li key={t._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>{t.title}</p>
                      <p style={{ fontSize: '0.76rem', color: 'var(--txt-muted)' }}>{t.projectId?.name}</p>
                    </div>
                    <span className={badgeCls}>{t.status}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
