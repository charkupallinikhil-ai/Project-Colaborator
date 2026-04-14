import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function CreateProject({ user }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', description: '' });
  const [allStudents, setAllStudents] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Only Leader and Teacher can access this page
  if (user.role === 'Student') {
    return (
      <div className="empty-state" style={{ marginTop: '4rem' }}>
        <div className="empty-state-icon">🚫</div>
        <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>Access Denied</p>
        <p>Only Leaders and Teachers can create projects.</p>
      </div>
    );
  }

  useEffect(() => {
    api.get('/auth/users')
      .then((res) => setAllStudents(res.data.filter((u) => u._id !== user.id)))
      .catch(console.error);
  }, []);

  const toggleMember = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Project name is required');
    if (!form.description.trim()) return setError('Description is required');
    setError('');
    setLoading(true);
    try {
      const body = { name: form.name, description: form.description, members: selectedMembers };
      await api.post('/projects', body);
      setSuccess('✅ Project created successfully! Redirecting…');
      setTimeout(() => navigate('/projects'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const students = allStudents.filter((u) => u.role === 'Student');
  const others = allStudents.filter((u) => u.role !== 'Student');

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Create New Project</h1>
          <p className="page-subtitle">Fill in the details and add team members</p>
        </div>
      </div>

      <div style={{ maxWidth: '640px' }}>
        <div className="section-card">
          <form onSubmit={handleSubmit} className="form-grid">
            {/* Project Name */}
            <label className="field">
              <span>Project Name *</span>
              <input
                id="project-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. E-Commerce Website"
                required
              />
            </label>

            {/* Description */}
            <label className="field">
              <span>Description *</span>
              <textarea
                id="project-description"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Describe the project goals, scope, and deliverables…"
                rows={4}
                required
              />
            </label>

            {/* Members */}
            <div className="field">
              <span>Add Members ({selectedMembers.length} selected)</span>
              {allStudents.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--txt-muted)', marginTop: '0.4rem' }}>
                  No other users registered yet. Invite your team to register first.
                </p>
              ) : (
                <>
                  {students.length > 0 && (
                    <>
                      <p style={{ fontSize: '0.78rem', color: 'var(--txt-muted)', marginBottom: '0.35rem', marginTop: '0.5rem', fontWeight: 600 }}>🎓 Students</p>
                      <div className="checkbox-list">
                        {students.map((u) => (
                          <label key={u._id} className="checkbox-item">
                            <input
                              type="checkbox"
                              checked={selectedMembers.includes(u._id)}
                              onChange={() => toggleMember(u._id)}
                            />
                            <span>{u.name} <span style={{ color: 'var(--txt-muted)', fontSize: '0.78rem' }}>({u.email})</span></span>
                          </label>
                        ))}
                      </div>
                    </>
                  )}
                  {others.length > 0 && (
                    <>
                      <p style={{ fontSize: '0.78rem', color: 'var(--txt-muted)', marginBottom: '0.35rem', marginTop: '0.75rem', fontWeight: 600 }}>👥 Leaders / Teachers</p>
                      <div className="checkbox-list">
                        {others.map((u) => (
                          <label key={u._id} className="checkbox-item">
                            <input
                              type="checkbox"
                              checked={selectedMembers.includes(u._id)}
                              onChange={() => toggleMember(u._id)}
                            />
                            <span>{u.name} <span style={{ color: 'var(--txt-muted)', fontSize: '0.78rem' }}>({u.role})</span></span>
                          </label>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Selected Members Preview */}
            {selectedMembers.length > 0 && (
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--txt-muted)', marginBottom: '0.4rem' }}>Selected Members:</p>
                <div className="member-chips">
                  {selectedMembers.map((id) => {
                    const u = allStudents.find((m) => m._id === id);
                    return u ? <span key={id} className="member-chip">👤 {u.name}</span> : null;
                  })}
                </div>
              </div>
            )}

            {error && <div className="error-box">⚠️ {error}</div>}
            {success && <div className="success-box">{success}</div>}

            <div className="flex-row">
              <button
                id="create-project-submit"
                className="button"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Creating…' : '✓ Create Project'}
              </button>
              <button
                type="button"
                className="button button-ghost"
                onClick={() => navigate('/projects')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateProject;
