import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function JoinProject() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return setError('Please enter a join code');
    setError('');
    setLoading(true);
    try {
      const resp = await api.post('/projects/join', { joinCode: joinCode.trim().toUpperCase() });
      setSuccess(`✅ Successfully joined "${resp.data.project.name}"! Redirecting…`);
      setTimeout(() => navigate('/projects'), 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Join a Project</h1>
          <p className="page-subtitle">Enter the join code given by your Teacher or Leader</p>
        </div>
      </div>

      <div style={{ maxWidth: '480px' }}>
        <div className="section-card">
          {/* Instructions */}
          <div style={{
            background: 'var(--accent-light)',
            borderRadius: 'var(--radius-sm)',
            padding: '1rem',
            marginBottom: '1.5rem',
            fontSize: '0.88rem',
            color: 'var(--accent-hover)',
          }}>
            <p style={{ fontWeight: 700, marginBottom: '0.35rem' }}>ℹ️ How to join a project</p>
            <p>Ask your Teacher or Leader for the 6-character project join code, then enter it below. You'll be added as a member instantly.</p>
          </div>

          <form onSubmit={handleSubmit} className="form-grid">
            <label className="field">
              <span>Project Join Code</span>
              <input
                id="join-code-input"
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g. WEB001"
                maxLength={6}
                style={{
                  textTransform: 'uppercase',
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  letterSpacing: '0.25em',
                  textAlign: 'center',
                  padding: '0.85rem',
                }}
                required
              />
            </label>

            {error   && <div className="error-box">⚠️ {error}</div>}
            {success && <div className="success-box">{success}</div>}

            <button
              id="join-project-submit"
              className="button"
              type="submit"
              disabled={loading || joinCode.trim().length !== 6}
            >
              {loading ? 'Joining…' : '🚀 Join Project'}
            </button>
          </form>
        </div>

        <div className="section-card" style={{ background: 'var(--bg-main)' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--txt-muted)', textAlign: 'center' }}>
            Already a member of a project?{' '}
            <button
              className="button button-sm button-ghost"
              style={{ marginLeft: '0.5rem' }}
              onClick={() => navigate('/projects')}
            >
              View My Projects
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default JoinProject;
