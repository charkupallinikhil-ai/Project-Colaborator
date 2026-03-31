import { useEffect, useMemo, useState } from 'react';
import { NavLink, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './App.css';

const BASE_API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const api = axios.create({ baseURL: BASE_API });

const token = localStorage.getItem('token');
if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;

const rolesNav = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/projects', label: 'Projects' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/contributions', label: 'Contribution' },
  { to: '/reports', label: 'Reports' },
  { to: '/profile', label: 'Profile' },
];

function setSessionData(user, tokenValue) {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('token', tokenValue);
  api.defaults.headers.common.Authorization = `Bearer ${tokenValue}`;
}

function clearSessionData() {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  delete api.defaults.headers.common.Authorization;
}

function Navbar({ user, onLogout }) {
  return (
    <header className="top-navbar" aria-label="top navigation">
      <div>
        <p className="brand-kicker">Student Collaboration Suite</p>
        <h1>Student Project Collaboration</h1>
      </div>
      <div className="top-navbar-actions">
        {user && <span className="welcome-chip">{user.name} ({user.role})</span>}
        {user && <button className="button button-ghost" onClick={onLogout}>Logout</button>}
      </div>
    </header>
  );
}

function Sidebar() {
  return (
    <aside className="sidebar">
      <p className="sidebar-title">Navigation</p>
      {rolesNav.map((item) => (
        <NavLink key={item.to} to={item.to} className={({isActive}) => `sidebar-link${isActive ? ' sidebar-link-active' : ''}`}>
          {item.label}
        </NavLink>
      ))}
    </aside>
  );
}

function Layout({ user, onLogout, children }) {
  return (
    <div className="app-shell">
      <Navbar user={user} onLogout={onLogout} />
      <div className="layout-grid">
        <Sidebar />
        <main className="content">{children}</main>
      </div>
    </div>
  );
}

function AuthLayout({ title, children, footer }) {
  return (
    <div className="auth-wrapper">
      <div className="auth-brand">
        <h1>{title}</h1>
        <p>Enter your account details to continue with the student collaboration platform.</p>
      </div>
      <section className="auth-card">
        {children}
        <div className="auth-alt">{footer}</div>
      </section>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', name }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} name={name} value={value} onChange={onChange} required />
    </label>
  );
}

function Loading() {
  return <p style={{ color: '#1e293b' }}>Loading...</p>;
}

function ErrorBox({ message }) {
  if (!message) return null;
  return <div className="error-box">{message}</div>;
}

function RequireAuth({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function LoginPage({ onAuth }) {
  const navigate = useNavigate();
  const [details, setDetails] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const resp = await api.post('/auth/login', details);
      setSessionData(resp.data.user, resp.data.token);
      onAuth(resp.data.user);
      navigate('/dashboard');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <AuthLayout title="Login">
      <form onSubmit={handleSubmit} className="form-grid">
        <Input label="Email" name="email" type="email" value={details.email} onChange={handleChange} />
        <Input label="Password" name="password" type="password" value={details.password} onChange={handleChange} />
        <button className="button" type="submit">Login</button>
      </form>
      <ErrorBox message={message} />
      <div className="help-text">
        Don't have an account? <NavLink to="/register">Register</NavLink>
      </div>
    </AuthLayout>
  );
}

function RegisterPage({ onAuth }) {
  const navigate = useNavigate();
  const [details, setDetails] = useState({ name: '', email: '', password: '', role: 'Student' });
  const [message, setMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const resp = await api.post('/auth/register', details);
      setSessionData(resp.data.user, resp.data.token);
      onAuth(resp.data.user);
      navigate('/dashboard');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <AuthLayout title="Register">
      <form onSubmit={handleSubmit} className="form-grid">
        <Input label="Name" name="name" value={details.name} onChange={handleChange} />
        <Input label="Email" name="email" type="email" value={details.email} onChange={handleChange} />
        <Input label="Password" name="password" type="password" value={details.password} onChange={handleChange} />
        <label className="field">
          <span>Role</span>
          <select name="role" value={details.role} onChange={handleChange}>
            <option value="Student">Student</option>
            <option value="Leader">Leader</option>
            <option value="Teacher">Teacher</option>
          </select>
        </label>
        <button className="button" type="submit">Create account</button>
      </form>
      <ErrorBox message={message} />
      <div className="help-text">
        Already have an account? <NavLink to="/login">Login</NavLink>
      </div>
    </AuthLayout>
  );
}

function DashboardPage({ user }) {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let canceled = false;
    async function load() {
      try {
        const [p, t] = await Promise.all([api.get('/projects'), api.get('/tasks')]);
        if (canceled) return;

        setProjects(p.data);
        setTasks(t.data);
        setReports(p.data.slice(0, 3));
      } catch (error) {
        console.error(error);
      } finally {
        if (!canceled) setLoading(false);
      }
    }
    load();
    return () => { canceled = true; };
  }, []);

  const completed = tasks.filter((task) => task.status === 'Done').length;
  const inProgress = tasks.filter((task) => task.status === 'In Progress').length;

  if (loading) return <Loading />;

  return (
    <section>
      <Section title="Dashboard" subtitle={`Welcome back, ${user.name}. Role: ${user.role}`}>
        <div className="stats-grid">
          <StatCard label="Projects" value={projects.length} />
          <StatCard label="Tasks" value={tasks.length} />
          <StatCard label="Completed" value={completed} />
          <StatCard label="In Progress" value={inProgress} />
        </div>
      </Section>

      <div className="two-col">
        <Section title="Project Summary">
          <ul className="member-list">
            {projects.map((p) => <li key={p._id}>{p.name} ({p.members?.length || 0} members)</li>)}
          </ul>
        </Section>

        <Section title="Recent Tasks">
          <ul className="activity-list">
            {tasks.slice(-5).map((task) => (
              <li key={task._id}>{task.title} - {task.status} </li>
            ))}
          </ul>
        </Section>
      </div>

      <Section title="Contribution Snapshot">
        <div className="progress-box">
          {tasks.slice(0, 5).map((task) => (
            <div key={task._id}>
              <strong>{task.title}</strong> <span>({task.status})</span>
              <div className="progress-track"><div className="progress-fill" style={{ width: task.status === 'Done' ? '100%' : task.status === 'In Progress' ? '60%' : '20%' }} /></div>
            </div>
          ))}
        </div>
      </Section>
    </section>
  );
}

function ProjectsPage({ user }) {
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', description: '', members: '' });

  useEffect(() => {
    async function loadData() {
      try {
        const pData = await api.get('/projects');
        setProjects(pData.data);

        const allUsers = await api.get('/auth/users').catch(() => ({ data: [] }));
        setMembers(allUsers.data);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = {
        name: form.name,
        description: form.description,
        members: form.members.split(',').map((m) => m.trim()).filter(Boolean),
      };
      const resp = await api.post('/projects', body);
      setProjects((prev) => [...prev, resp.data]);
      setForm({ name: '', description: '', members: '' });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create project');
    }
  };

  return (
    <section>
      <Section title="Projects" subtitle="Manage your projects from one place.">
        {user.role === 'Leader' && (
          <form className="form-grid" onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
            <Input label="Project Name" name="name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
            <label className="field">
              <span>Description</span>
              <textarea name="description" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} rows="3" required />
            </label>
            <label className="field">
              <span>Members (emails comma separated)</span>
              <input name="members" value={form.members} onChange={(e) => setForm((prev) => ({ ...prev, members: e.target.value }))} placeholder="student1@example.com,student2@example.com" />
            </label>
            <button className="button" type="submit">Create Project</button>
          </form>
        )}

        <ErrorBox message={error} />

        <div className="section-card">
          {projects.length === 0 ? <p>No projects found</p> : (
            <ul className="member-list">
              {projects.map((project) => (
                <li key={project._id}>
                  <NavLink to={`/projects/${project._id}`} className="link-item">{project.name}</NavLink> - {project.description}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Section>
    </section>
  );
}

function ProjectDetailsPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [files, setFiles] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    async function loadDetails() {
      const [projectResp, tasksResp, filesResp] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get('/tasks'),
        api.get(`/files/${id}`),
      ]);
      setProject(projectResp.data);
      setTasks(tasksResp.data.filter((task) => task.projectId?._id === id));
      setFiles(filesResp.data);
    }
    loadDetails().catch(console.error);
  }, [id]);

  const filteredTasks = statusFilter ? tasks.filter((task) => task.status === statusFilter) : tasks;

  if (!project) return <Loading />;

  return (
    <section>
      <Section title="Project Details" subtitle={project.name}>
        <p>{project.description}</p>
        <p>Leader: {project.leader?.name}</p>
        <p>Members: {project.members?.map((m) => m.name).join(', ')}</p>

        <div className="flex-row"><label>Status:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>

        <div className="section-card">
          <h4>Tasks</h4>
          {filteredTasks.length === 0 ? <p>No tasks</p> : (
            <ul className="activity-list">
              {filteredTasks.map((task) => <li key={task._id}>{task.title} - {task.status} - {task.assignedTo?.name}</li>)}
            </ul>
          )}
        </div>

        <div className="section-card">
          <h4>Files</h4>
          {files.length === 0 ? <p>No files uploaded.</p> : (
            <ul className="activity-list">
              {files.map((f) => <li key={f._id}>{f.filename} by {f.uploadedBy?.name}</li>)}
            </ul>
          )}
        </div>
      </Section>
    </section>
  );
}

function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ title: '', assignedTo: '', projectId: '', points: 1 });
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [t, p, users] = await Promise.all([api.get('/tasks'), api.get('/projects'), api.get('/auth/users').catch(() => ({ data: [] }))]);
        setTasks(t.data);
        setMembers(users.data);
        setForm((f) => ({ ...f, projectId: p.data[0]?._id || '' }));
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const updateTaskStatus = async (taskId, nextStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: nextStatus });
      setTasks((prev) => prev.map((task) => (task._id === taskId ? { ...task, status: nextStatus } : task)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resp = await api.post('/tasks', form);
      setTasks((prev) => [...prev, resp.data]);
      setForm({ title: '', assignedTo: '', projectId: form.projectId, points: 1 });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    }
  };

  return (
    <section>
      <Section title="Tasks" subtitle="Track and update tasks.">
        <form className="form-grid" onSubmit={handleSubmit}>
          <Input label="Title" name="title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <label className="field">
            <span>Assign to</span>
            <select value={form.assignedTo} onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))} required>
              <option value="">Select</option>
              {members.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Project</span>
            <input name="projectId" value={form.projectId} onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value }))} placeholder="Project ID" required />
          </label>
          <Input label="Points" name="points" type="number" value={form.points} onChange={(e) => setForm((f) => ({ ...f, points: Number(e.target.value) }))} />
          <button className="button" type="submit">Create Task</button>
        </form>

        <ErrorBox message={error} />

        <div className="section-card">
          {tasks.map((task) => (
            <div key={task._id} className="task-row">
              <strong>{task.title}</strong> assigned to {task.assignedTo?.name || 'unassigned'} - {task.status}
              <div>
                <button className="button button-small" onClick={() => updateTaskStatus(task._id, 'In Progress')}>In Progress</button>
                <button className="button button-small" onClick={() => updateTaskStatus(task._id, 'Done')}>Done</button>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </section>
  );
}

function ContributionPage() {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    async function load() {
      const p = await api.get('/projects');
      setProjects(p.data);
      setSelected(p.data[0]?._id || '');
    }
    load().catch(console.error);
  }, []);

  useEffect(() => {
    if (!selected) return;
    api.get(`/contribution/${selected}`).then((resp) => setData(resp.data)).catch(console.error);
  }, [selected]);

  return (
    <section>
      <Section title="Contribution" subtitle="Track project contributions.">
        <label className="field">
          <span>Select Project</span>
          <select value={selected} onChange={(e) => setSelected(e.target.value)}>
            {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </label>

        {data && (
          <div className="section-card">
            <h4>{data.project}</h4>
            <p>Total points: {data.totalPoints}</p>
            <ul className="activity-list">
              {data.contribution.map((item) => (
                <li key={item.name}>{item.name}: {item.completedPoints} points ({item.percent}%)</li>
              ))}
            </ul>
          </div>
        )}
      </Section>
    </section>
  );
}

function ReportsPage() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    api.get('/projects').then((resp) => setProjects(resp.data)).catch(console.error);
  }, []);

  return (
    <section>
      <Section title="Reports" subtitle="Project performance & analytics.">
        {projects.map((project) => (
          <div key={project._id} className="section-card">
            <h3>{project.name}</h3>
            <p>{project.description}</p>
            <p>Leader: {project.leader?.name}</p>
            <p>Members: {project.members?.length || 0}</p>
          </div>
        ))}
      </Section>
    </section>
  );
}

function ProfilePage({ user }) {
  const [contribution, setContribution] = useState([]);

  useEffect(() => {
    api.get('/projects').then((projectRes) => {
      if (!projectRes.data?.length) return;
      const id = projectRes.data[0]._id;
      return api.get(`/contribution/${id}`);
    }).then((resp) => { if (resp?.data?.contribution) setContribution(resp.data.contribution); }).catch(console.error);
  }, []);

  return (
    <section>
      <Section title="Profile" subtitle="Your account details and contribution metrics">
        <div className="section-card">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </div>

        <div className="section-card">
          <h4>Contribution by project</h4>
          <ul className="activity-list">
            {contribution.map((c) => <li key={c.name}>{c.name} - {c.percent}%</li>)}
          </ul>
        </div>
      </Section>
    </section>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div className="section-card">
      <div className="section-head">
        <div>
          <h2>{title}</h2>
          {subtitle && <p className="muted">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <article className="stat-card">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </article>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });

  const onLogout = () => {
    clearSessionData();
    setUser(null);
  };

  useEffect(() => {
    const tokenValue = localStorage.getItem('token');
    if (tokenValue && !api.defaults.headers.common.Authorization) api.defaults.headers.common.Authorization = `Bearer ${tokenValue}`;
  }, []);

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage onAuth={setUser} />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage onAuth={setUser} />} />

      <Route path="/*" element={
        <RequireAuth user={user}>
          <Layout user={user} onLogout={onLogout}>
            <Routes>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage user={user} />} />
              <Route path="projects" element={<ProjectsPage user={user} />} />
              <Route path="projects/:id" element={<ProjectDetailsPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="contributions" element={<ContributionPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="profile" element={<ProfilePage user={user} />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        </RequireAuth>
      } />
    </Routes>
  );
}
