import { useEffect, useState } from 'react';
import api from '../api';
import TaskCard from '../components/TaskCard';

function Tasks({ user }) {
  const [tasks, setTasks]       = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]); // members of selected project
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [filterStatus, setFilterStatus]   = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [showForm, setShowForm] = useState(false);

  const isLeaderOrTeacher = user.role === 'Leader' || user.role === 'Teacher';

  const [form, setForm] = useState({
    title: '', description: '', assignedTo: '', projectId: '', deadline: '', points: 1,
  });

  // Load tasks and projects on mount
  useEffect(() => {
    let canceled = false;
    async function load() {
      try {
        const [tRes, pRes] = await Promise.all([api.get('/tasks'), api.get('/projects')]);
        if (canceled) return;
        setTasks(tRes.data);
        setProjects(pRes.data);
        if (pRes.data.length > 0) {
          const firstId = pRes.data[0]._id;
          setForm((f) => ({ ...f, projectId: firstId }));
          setProjectMembers(pRes.data[0].members || []);
        }
      } catch {
        if (!canceled) setError('Failed to load data');
      } finally {
        if (!canceled) setLoading(false);
      }
    }
    load();
    return () => { canceled = true; };
  }, []);

  // When selected project changes in create form, update member dropdown
  const handleProjectChange = (projectId) => {
    setForm((f) => ({ ...f, projectId, assignedTo: '' }));
    const proj = projects.find((p) => p._id === projectId);
    setProjectMembers(proj?.members || []);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!form.title.trim())  return setError('Task title is required');
    if (!form.assignedTo)    return setError('Please assign the task to a project member');
    if (!form.projectId)     return setError('Please select a project');
    setError('');
    try {
      const resp = await api.post('/tasks', form);
      setTasks((prev) => [resp.data, ...prev]);
      setForm({ title: '', description: '', assignedTo: '', projectId: form.projectId, deadline: '', points: 1 });
      setSuccess('✅ Task created successfully!');
      setShowForm(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const resp = await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks((prev) => prev.map((t) => t._id === taskId ? resp.data : t));
    } catch (err) { setError(err.response?.data?.message || 'Failed to update status'); }
  };

  const handleSubmit = async (taskId, submissionLink) => {
    try {
      const resp = await api.put(`/tasks/${taskId}`, { submissionLink });
      setTasks((prev) => prev.map((t) => t._id === taskId ? resp.data : t));
      setSuccess('✅ Task submitted for review!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.response?.data?.message || 'Failed to submit task'); }
  };

  const handleApprove = async (taskId) => {
    try {
      const resp = await api.put(`/tasks/${taskId}/approve`);
      setTasks((prev) => prev.map((t) => t._id === taskId ? resp.data : t));
      setSuccess('✅ Task approved!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.response?.data?.message || 'Failed to approve task'); }
  };

  const handleReject = async (taskId) => {
    try {
      const resp = await api.put(`/tasks/${taskId}/reject`);
      setTasks((prev) => prev.map((t) => t._id === taskId ? resp.data : t));
      setSuccess('Task sent back to In Progress.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.response?.data?.message || 'Failed to reject task'); }
  };

  const handleAssigneeChange = async (taskId, newAssigneeId) => {
    try {
      const resp = await api.put(`/tasks/${taskId}`, { assignedTo: newAssigneeId });
      setTasks((prev) => prev.map((t) => t._id === taskId ? resp.data : t));
    } catch (err) { setError(err.response?.data?.message || 'Failed to update assignee'); }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) { setError(err.response?.data?.message || 'Failed to delete task'); }
  };

  const filtered = tasks.filter((t) => {
    if (filterStatus  && t.status           !== filterStatus)          return false;
    if (filterProject && t.projectId?._id   !== filterProject)         return false;
    return true;
  });

  // For task cards — get all members of the task's project
  const getMembersForTask = (task) => {
    const proj = projects.find((p) => p._id === task.projectId?._id);
    return proj?.members || [];
  };

  if (loading) {
    return <div className="loading-state"><div className="spinner" /><span>Loading tasks…</span></div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Tasks</h1>
          <p className="page-subtitle">
            {user.role === 'Student' ? 'Your assigned tasks — update status and submit work' : 'Manage, assign, approve and review tasks'}
          </p>
        </div>
        {isLeaderOrTeacher && (
          <button id="new-task-btn" className="button" onClick={() => setShowForm((v) => !v)}>
            {showForm ? '✕ Cancel' : '+ New Task'}
          </button>
        )}
      </div>

      {/* Create Task Form */}
      {isLeaderOrTeacher && showForm && (
        <div className="section-card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Create New Task</h2>
          <form onSubmit={handleCreateTask} className="form-grid">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <label className="field">
                <span>Task Title *</span>
                <input id="task-title" type="text" value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Design homepage mockup" required />
              </label>
              <label className="field">
                <span>Points</span>
                <input id="task-points" type="number" min={1} max={10} value={form.points}
                  onChange={(e) => setForm((f) => ({ ...f, points: Number(e.target.value) }))} />
              </label>
            </div>

            <label className="field">
              <span>Description</span>
              <textarea id="task-description" value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Task details and requirements…" rows={2} />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              {/* Project selector — must pick this first */}
              <label className="field">
                <span>Project *</span>
                <select id="task-project" value={form.projectId}
                  onChange={(e) => handleProjectChange(e.target.value)} required>
                  <option value="">Select project…</option>
                  {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </label>

              {/* Assignee — only project members */}
              <label className="field">
                <span>Assign To * {form.projectId && `(${projectMembers.length} members)`}</span>
                <select id="task-assignee" value={form.assignedTo}
                  onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))}
                  required disabled={!form.projectId}>
                  <option value="">{form.projectId ? 'Select member…' : 'Pick project first'}</option>
                  {projectMembers.map((m) => (
                    <option key={m._id} value={m._id}>{m.name} ({m.role})</option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Deadline</span>
                <input id="task-deadline" type="date" value={form.deadline}
                  onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))} />
              </label>
            </div>

            {error && <div className="error-box">⚠️ {error}</div>}
            <button id="task-submit" className="button" type="submit" style={{ alignSelf: 'flex-start' }}>
              ✓ Create Task
            </button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="filter-bar">
        <select id="filter-status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Submitted">Submitted</option>
          <option value="Approved">Approved</option>
        </select>
        {isLeaderOrTeacher && (
          <select id="filter-project" value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
            <option value="">All Projects</option>
            {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        )}
        {/* Pending approvals badge */}
        {isLeaderOrTeacher && tasks.filter((t) => t.status === 'Submitted').length > 0 && (
          <span style={{
            background: 'var(--warning-bg)', color: 'var(--warning)',
            borderRadius: '99px', padding: '0.25rem 0.75rem',
            fontSize: '0.8rem', fontWeight: 700,
          }}>
            ⏳ {tasks.filter((t) => t.status === 'Submitted').length} pending approval
          </span>
        )}
        <span style={{ fontSize: '0.85rem', color: 'var(--txt-muted)', marginLeft: 'auto' }}>
          {filtered.length} task{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {!showForm && error   && <div className="error-box"   style={{ marginBottom: '1rem' }}>⚠️ {error}</div>}
      {success && <div className="success-box" style={{ marginBottom: '1rem' }}>{success}</div>}

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <p style={{ fontWeight: 600, marginBottom: '0.4rem' }}>No tasks found</p>
          <p>{isLeaderOrTeacher ? 'Create a task to get started.' : 'No tasks assigned to you yet.'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filtered.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              user={user}
              members={getMembersForTask(task)}
              onStatusChange={handleStatusChange}
              onSubmit={handleSubmit}
              onApprove={isLeaderOrTeacher ? handleApprove : null}
              onReject={isLeaderOrTeacher ? handleReject : null}
              onAssigneeChange={isLeaderOrTeacher ? handleAssigneeChange : null}
              onDelete={isLeaderOrTeacher ? handleDelete : null}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Tasks;
