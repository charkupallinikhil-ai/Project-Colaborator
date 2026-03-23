import { useMemo, useState } from 'react'
import { NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import './App.css'

const demoUsers = [
  {
    name: 'Aarav Singh',
    email: 'student@college.edu',
    password: 'Student@123',
    role: 'Student',
  },
  {
    name: 'Riya Verma',
    email: 'leader@college.edu',
    password: 'Leader@123',
    role: 'Leader',
  },
  {
    name: 'Dr. Mehta',
    email: 'teacher@college.edu',
    password: 'Teacher@123',
    role: 'Teacher',
  },
]

const stats = {
  totalProjects: 8,
  totalTasks: 42,
  completedTasks: 28,
  pendingTasks: 14,
}

const activities = [
  'Final report uploaded for Smart Attendance project',
  'New task assigned to Ananya in Eco Data Dashboard',
  'Milestone 2 marked complete by Team Insight',
  'Teacher feedback added on UI refinement',
]

const projectsData = [
  {
    id: 1,
    name: 'Smart Attendance System',
    description:
      'Face-recognition based attendance workflow for classroom automation.',
    members: ['Aarav', 'Neha', 'Rohan', 'Isha'],
    status: 'In Progress',
  },
  {
    id: 2,
    name: 'Eco Data Dashboard',
    description:
      'Interactive environmental data dashboard for district-level reporting.',
    members: ['Ananya', 'Vikram', 'Kabir'],
    status: 'Pending',
  },
  {
    id: 3,
    name: 'Campus Navigation Assistant',
    description:
      'Indoor and outdoor navigation support for new students and visitors.',
    members: ['Meera', 'Sanjay', 'Aditi', 'Dev'],
    status: 'Completed',
  },
]

const initialTasks = [
  { id: 1, name: 'Create wireframes', member: 'Neha', status: 'Done' },
  {
    id: 2,
    name: 'Build API integration plan',
    member: 'Rohan',
    status: 'In Progress',
  },
  { id: 3, name: 'Prepare test cases', member: 'Aarav', status: 'Pending' },
]

const contributions = [
  { name: 'Aarav', percent: 82 },
  { name: 'Neha', percent: 70 },
  { name: 'Rohan', percent: 64 },
  { name: 'Isha', percent: 48 },
]

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/projects', label: 'Projects' },
  { to: '/projects/create', label: 'Create Project' },
  { to: '/projects/1', label: 'Project Details' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/contributions', label: 'Contributions' },
  { to: '/reports', label: 'Reports' },
  { to: '/profile', label: 'Profile' },
]

function Section({ title, subtitle, children, actions }) {
  return (
    <section className="section-card">
      <div className="section-head">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p className="muted">{subtitle}</p> : null}
        </div>
        {actions ? <div className="section-actions">{actions}</div> : null}
      </div>
      {children}
    </section>
  )
}

function StatCard({ label, value, accent }) {
  return (
    <article className="stat-card">
      <p className="stat-label">{label}</p>
      <p className={`stat-value ${accent ? 'accent' : ''}`}>{value}</p>
    </article>
  )
}

function StatusPill({ status }) {
  return <span className={`status status-${status.toLowerCase().replace(' ', '-')}`}>{status}</span>
}

function TopNavbar({ currentUser, onLogout }) {
  return (
    <header className="top-navbar">
      <div>
        <p className="brand-kicker">Student Collaboration Suite</p>
        <h1>Student Project Collaboration Platform</h1>
      </div>
      <div className="top-navbar-actions">
        <span className="welcome-chip">{currentUser.name} ({currentUser.role})</span>
        <button className="button button-ghost" type="button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  )
}

function Sidebar() {
  return (
    <aside className="sidebar">
      <p className="sidebar-title">Navigation</p>
      <nav>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

function AppLayout({ children, currentUser, onLogout }) {
  return (
    <div className="app-shell">
      <TopNavbar currentUser={currentUser} onLogout={onLogout} />
      <div className="layout-grid">
        <Sidebar />
        <main className="content">{children}</main>
      </div>
    </div>
  )
}

function AuthLayout({ title, subtitle, children, alternateAction }) {
  return (
    <div className="auth-wrapper">
      <div className="auth-brand">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <section className="auth-card">
        {children}
        <div className="auth-alt">{alternateAction}</div>
      </section>
    </div>
  )
}

function AuthInput({ id, label, type = 'text', placeholder, value, onChange }) {
  return (
    <label htmlFor={id} className="field">
      <span>{label}</span>
      <input id={id} type={type} placeholder={placeholder} value={value} onChange={onChange} />
    </label>
  )
}

function LoginPage({ users, onLogin }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    const matchedUser = users.find(
      (user) =>
        user.email.toLowerCase() === form.email.trim().toLowerCase() &&
        user.password === form.password,
    )

    if (!matchedUser) {
      setError('Invalid email or password. Use one of the demo credentials listed below.')
      return
    }

    setError('')
    onLogin(matchedUser)
    navigate('/dashboard')
  }

  return (
    <AuthLayout
      title="Sign In"
      subtitle="Access project workspaces, tasks, and reports."
      alternateAction={
        <p>
          New here? <NavLink to="/register">Create an account</NavLink>
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <AuthInput
          id="login-email"
          label="Email"
          type="email"
          placeholder="name@college.edu"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
        />
        <AuthInput
          id="login-password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
        />
        {error ? <p className="form-error">{error}</p> : null}
        <div className="credential-box">
          <p className="credential-title">Demo credentials</p>
          <ul>
            {demoUsers.map((user) => (
              <li key={user.email}>
                {user.role}: {user.email} / {user.password}
              </li>
            ))}
          </ul>
        </div>
        <button className="button" type="submit">
          Login
        </button>
      </form>
    </AuthLayout>
  )
}

function RegisterPage({ users, onRegister }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Student',
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Please fill in all required fields.')
      setMessage('')
      return
    }

    const alreadyExists = users.some(
      (user) => user.email.toLowerCase() === form.email.trim().toLowerCase(),
    )
    if (alreadyExists) {
      setError('An account with this email already exists. Please log in instead.')
      setMessage('')
      return
    }

    onRegister({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role,
    })

    setError('')
    setMessage('Registration successful. Redirecting to login...')
    setTimeout(() => {
      navigate('/login')
    }, 900)
  }

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Register as Student, Leader, or Teacher."
      alternateAction={
        <p>
          Already registered? <NavLink to="/login">Go to login</NavLink>
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <AuthInput
          id="register-name"
          label="Full Name"
          placeholder="Your full name"
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
        />
        <AuthInput
          id="register-email"
          label="Email"
          type="email"
          placeholder="name@college.edu"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
        />
        <AuthInput
          id="register-password"
          label="Password"
          type="password"
          placeholder="Create a password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
        />
        <label htmlFor="register-role" className="field">
          <span>Role</span>
          <select
            id="register-role"
            value={form.role}
            onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
          >
            <option>Student</option>
            <option>Leader</option>
            <option>Teacher</option>
          </select>
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        {message ? <p className="form-success">{message}</p> : null}
        <button className="button" type="submit">
          Register
        </button>
      </form>
    </AuthLayout>
  )
}

function DashboardPage() {
  const completion = Math.round((stats.completedTasks / stats.totalTasks) * 100)

  return (
    <>
      <div className="stats-grid">
        <StatCard label="Total Projects" value={stats.totalProjects} />
        <StatCard label="Total Tasks" value={stats.totalTasks} />
        <StatCard label="Completed Tasks" value={stats.completedTasks} accent />
        <StatCard label="Pending Tasks" value={stats.pendingTasks} />
      </div>

      <div className="two-col">
        <Section title="Recent Activities" subtitle="Latest updates from all project groups">
          <ul className="activity-list">
            {activities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Section>

        <Section title="Progress Overview" subtitle="Current task completion state">
          <div className="progress-box">
            <p className="muted">Task completion</p>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${completion}%` }}></div>
            </div>
            <p className="progress-meta">{completion}% completed</p>
          </div>
        </Section>
      </div>
    </>
  )
}

function ProjectsPage() {
  return (
    <Section title="Projects" subtitle="All team projects and their current status">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Members</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {projectsData.map((project) => (
              <tr key={project.id}>
                <td>{project.name}</td>
                <td>{project.members.join(', ')}</td>
                <td>
                  <StatusPill status={project.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  )
}

function CreateProjectPage() {
  return (
    <Section title="Create Project" subtitle="Add a new project and assign members">
      <form className="form-grid" onSubmit={(event) => event.preventDefault()}>
        <AuthInput id="project-name" label="Project Name" placeholder="Enter project title" />
        <label htmlFor="project-description" className="field">
          <span>Description</span>
          <textarea id="project-description" rows="5" placeholder="Brief project description"></textarea>
        </label>
        <AuthInput id="project-members" label="Members" placeholder="Comma-separated names" />
        <button type="submit" className="button">
          Create Project
        </button>
      </form>
    </Section>
  )
}

function ProjectDetailsPage() {
  const project = projectsData[0]
  return (
    <>
      <Section title="Project Information" subtitle={project.name}>
        <p>{project.description}</p>
        <div className="chip-row">
          <StatusPill status={project.status} />
          <span className="chip">Members: {project.members.length}</span>
        </div>
      </Section>

      <div className="two-col">
        <Section title="Members" subtitle="Assigned team participants">
          <ul className="member-list">
            {project.members.map((member) => (
              <li key={member}>{member}</li>
            ))}
          </ul>
        </Section>

        <Section title="Tasks" subtitle="Project-specific tasks">
          <ul className="member-list">
            {initialTasks.map((task) => (
              <li key={task.id}>
                {task.name} - <StatusPill status={task.status} />
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <Section title="Files" subtitle="Upload project resources and attachments">
        <div className="upload-strip">
          <input type="file" />
          <button className="button" type="button">
            Upload File
          </button>
        </div>
      </Section>
    </>
  )
}

function TasksPage() {
  const [tasks, setTasks] = useState(initialTasks)
  const [form, setForm] = useState({ name: '', member: '', status: 'Pending' })

  const members = useMemo(
    () => Array.from(new Set(projectsData.flatMap((project) => project.members))),
    [],
  )

  const handleCreateTask = (event) => {
    event.preventDefault()
    if (!form.name.trim() || !form.member) {
      return
    }

    setTasks((prevTasks) => [
      ...prevTasks,
      {
        id: prevTasks.length + 1,
        name: form.name.trim(),
        member: form.member,
        status: form.status,
      },
    ])

    setForm({ name: '', member: '', status: 'Pending' })
  }

  return (
    <>
      <Section title="Create Task" subtitle="Assign task ownership and status">
        <form className="form-grid" onSubmit={handleCreateTask}>
          <label htmlFor="task-name" className="field">
            <span>Task Name</span>
            <input
              id="task-name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Enter task name"
            />
          </label>

          <label htmlFor="task-member" className="field">
            <span>Assign Member</span>
            <select
              id="task-member"
              value={form.member}
              onChange={(event) => setForm((prev) => ({ ...prev, member: event.target.value }))}
            >
              <option value="">Select member</option>
              {members.map((member) => (
                <option key={member} value={member}>
                  {member}
                </option>
              ))}
            </select>
          </label>

          <label htmlFor="task-status" className="field">
            <span>Status</span>
            <select
              id="task-status"
              value={form.status}
              onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
            >
              <option>Pending</option>
              <option>In Progress</option>
              <option>Done</option>
            </select>
          </label>

          <button className="button" type="submit">
            Add Task
          </button>
        </form>
      </Section>

      <Section title="Task List" subtitle="Current tasks and statuses">
        <div className="task-grid">
          {tasks.map((task) => (
            <article className="task-card" key={task.id}>
              <p className="task-title">{task.name}</p>
              <p className="muted">Assigned to {task.member}</p>
              <StatusPill status={task.status} />
            </article>
          ))}
        </div>
      </Section>
    </>
  )
}

function ContributionPage() {
  return (
    <Section title="Contribution Tracking" subtitle="Member-level contribution percentage">
      <div className="contribution-list">
        {contributions.map((member) => (
          <div className="contribution-item" key={member.name}>
            <div className="contribution-head">
              <p>{member.name}</p>
              <p>{member.percent}%</p>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${member.percent}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

function ReportsPage() {
  return (
    <>
      <Section title="File Sharing" subtitle="Upload reports, documents, and summaries">
        <div className="upload-strip">
          <input type="file" />
          <button className="button" type="button">
            Upload Report File
          </button>
        </div>
      </Section>

      <Section
        title="Report Generation"
        subtitle="Generate and preview report output"
        actions={
          <button className="button" type="button">
            Generate Report
          </button>
        }
      >
        <div className="report-preview">
          <h3>Preview</h3>
          <p>
            Report preview will appear here after generation. This placeholder helps visualize where
            summary insights, charts, and export options will be displayed.
          </p>
        </div>
      </Section>
    </>
  )
}

function ProfilePage({ currentUser }) {
  return (
    <div className="two-col">
      <Section title="User Details" subtitle="Profile information">
        <div className="profile-block">
          <p>
            <strong>Name:</strong> {currentUser.name}
          </p>
          <p>
            <strong>Email:</strong> {currentUser.email}
          </p>
          <p>
            <strong>Role:</strong> {currentUser.role}
          </p>
        </div>
      </Section>

      <Section title="Participation" subtitle="Projects and contribution score">
        <ul className="member-list">
          {projectsData.map((project) => (
            <li key={project.id}>{project.name}</li>
          ))}
        </ul>
        <div className="profile-score">
          <p className="muted">Overall Contribution Score</p>
          <p className="score">78 / 100</p>
        </div>
      </Section>
    </div>
  )
}

function ProtectedRoute({ children, currentUser, onLogout }) {
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  return (
    <AppLayout currentUser={currentUser} onLogout={onLogout}>
      {children}
    </AppLayout>
  )
}

function App() {
  const [users, setUsers] = useState(demoUsers)
  const [currentUser, setCurrentUser] = useState(null)

  const handleRegister = (newUser) => {
    setUsers((prevUsers) => [...prevUsers, newUser])
  }

  const handleLogout = () => {
    setCurrentUser(null)
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={currentUser ? '/dashboard' : '/login'} replace />}
      />
      <Route
        path="/login"
        element={
          currentUser ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage users={users} onLogin={setCurrentUser} />
          )
        }
      />
      <Route
        path="/register"
        element={
          currentUser ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <RegisterPage users={users} onRegister={handleRegister} />
          )
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute currentUser={currentUser} onLogout={handleLogout}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute currentUser={currentUser} onLogout={handleLogout}>
            <ProjectsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/create"
        element={
          <ProtectedRoute currentUser={currentUser} onLogout={handleLogout}>
            <CreateProjectPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:id"
        element={
          <ProtectedRoute currentUser={currentUser} onLogout={handleLogout}>
            <ProjectDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute currentUser={currentUser} onLogout={handleLogout}>
            <TasksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contributions"
        element={
          <ProtectedRoute currentUser={currentUser} onLogout={handleLogout}>
            <ContributionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute currentUser={currentUser} onLogout={handleLogout}>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute currentUser={currentUser} onLogout={handleLogout}>
            <ProfilePage currentUser={currentUser} />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={<Navigate to={currentUser ? '/dashboard' : '/login'} replace />}
      />
    </Routes>
  )
}

export default App
