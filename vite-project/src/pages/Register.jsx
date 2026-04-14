import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../api';

function Register({ onAuth }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const resp = await api.post('/auth/register', form);
      localStorage.setItem('token', resp.data.token);
      localStorage.setItem('user', JSON.stringify(resp.data.user));
      onAuth(resp.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roleDescriptions = {
    Student: 'View projects, update your assigned tasks',
    Leader:  'Create projects, assign and manage tasks',
    Teacher: 'Full access — monitor all projects and generate reports',
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-brand">
        <div className="auth-logo">✨</div>
        <h1>Create Account</h1>
        <p>Join the Student Project Collaboration Platform</p>
      </div>

      <section className="auth-card">
        <form onSubmit={handleSubmit} className="form-grid">
          <label className="field">
            <span>Full Name</span>
            <input
              id="register-name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </label>

          <label className="field">
            <span>Email Address</span>
            <input
              id="register-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              id="register-password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </label>

          <label className="field">
            <span>Select Your Role</span>
            <select id="register-role" name="role" value={form.role} onChange={handleChange}>
              <option value="Student">🎓 Student</option>
              <option value="Leader">🏆 Leader</option>
              <option value="Teacher">👩‍🏫 Teacher</option>
            </select>
          </label>

          {form.role && (
            <div style={{
              background: 'var(--accent-light)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.65rem 0.9rem',
              fontSize: '0.83rem',
              color: 'var(--accent-hover)',
            }}>
              ℹ️ <strong>{form.role}:</strong> {roleDescriptions[form.role]}
            </div>
          )}

          {error && <div className="error-box">⚠️ {error}</div>}

          <button id="register-submit" className="button" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <div className="auth-alt">
          Already have an account?{' '}
          <NavLink to="/login">Sign in here</NavLink>
        </div>
      </section>
    </div>
  );
}

export default Register;
