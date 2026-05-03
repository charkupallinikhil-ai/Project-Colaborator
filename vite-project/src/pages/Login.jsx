import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../api';

function Login({ onAuth }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const demoAccounts = [
    { label: 'Student', name: 'Student User', email: 'student@college.edu', password: 'Student@123', role: 'Student' },
    { label: 'Leader', name: 'Leader User', email: 'leader@college.edu', password: 'Leader@123', role: 'Leader' },
    { label: 'Teacher', name: 'Teacher User', email: 'teacher@college.edu', password: 'Teacher@123', role: 'Teacher' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await doLogin(form);
  };

  const doLogin = async (credentials) => {
    setError('');
    setLoading(true);
    try {
      const resp = await api.post('/auth/login', credentials);
      localStorage.setItem('token', resp.data.token);
      localStorage.setItem('user', JSON.stringify(resp.data.user));
      onAuth(resp.data.user);
      navigate('/dashboard');
    } catch (err) {
      const isNetworkError = !err.response;
      const demoUser = demoAccounts.find((account) => account.email === credentials.email && account.password === credentials.password);
      if (isNetworkError && demoUser) {
        const localUser = { id: demoUser.email, name: demoUser.name, email: demoUser.email, role: demoUser.role };
        localStorage.setItem('token', 'demo-token');
        localStorage.setItem('user', JSON.stringify(localUser));
        onAuth(localUser);
        navigate('/dashboard');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDirectLogin = async (account) => {
    await doLogin({ email: account.email, password: account.password });
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-brand">
        <div className="auth-logo">🎓</div>
        <h1>Welcome Back</h1>
        <p>Sign in to the Student Project Collaboration Platform</p>
      </div>

      <section className="auth-card">
        <form onSubmit={handleSubmit} className="form-grid">
          <label className="field">
            <span>Email Address</span>
            <input
              id="login-email"
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
              id="login-password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </label>

          {error && <div className="error-box">⚠️ {error}</div>}

          <button id="login-submit" className="button" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="demo-section">
          <p className="demo-title">Direct login — Click a role to sign in immediately:</p>
          <div className="demo-buttons">
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                className="button button-demo"
                onClick={() => handleDirectLogin(acc)}
                disabled={loading}
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>

        <div className="auth-alt">
          Don't have an account?{' '}
          <NavLink to="/register">Create one here</NavLink>
        </div>
      </section>
    </div>
  );
}

export default Login;
