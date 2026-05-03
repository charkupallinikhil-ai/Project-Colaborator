import { useState, useEffect } from 'react';
import api from '../api';

function statusClass(status) {
  if (status === 'Approved')   return 'done';
  if (status === 'Submitted')  return 'in-progress';
  if (status === 'In Progress') return 'in-progress';
  return 'pending';
}

function statusBadge(status) {
  if (status === 'Approved')    return 'badge badge-done';
  if (status === 'Submitted')   return 'badge badge-progress';
  if (status === 'In Progress') return 'badge badge-progress';
  return 'badge badge-pending';
}

function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function TaskCard({ task, user, members = [], onStatusChange, onAssigneeChange, onSubmit, onApprove, onReject, onDelete }) {
  const isStudent         = user?.role === 'Student';
  const isLeaderOrTeacher = user?.role === 'Leader' || user?.role === 'Teacher';
  const isOverdue = task.deadline && task.status !== 'Approved' && new Date(task.deadline) < new Date();

  const [showSubmit, setShowSubmit] = useState(false);
  const [file, setFile]             = useState(null);
  const [uploading, setUploading]   = useState(false);
  const [taskFiles, setTaskFiles]   = useState([]);

  const loadFiles = async () => {
    try {
      const res = await api.get(`/files/task/${task._id}`);
      setTaskFiles(res.data);
    } catch (err) {
      // Ignore errors
    }
  };

  useEffect(() => {
    loadFiles();
  }, [task._id]);

  const handleSubmitFile = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', task.projectId._id);
      formData.append('taskId', task._id);
      await api.post('/files', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // After upload, mark as submitted
      onSubmit && onSubmit(task._id, ''); // Empty link, but status changes
      setShowSubmit(false);
      setFile(null);
      // Reload files
      loadFiles();
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    try {
      await api.delete(`/files/${fileId}`);
      // Reload files
      loadFiles();
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  return (
    <div className={`task-card ${statusClass(task.status)}`}>
      {/* Header */}
      <div className="flex-between">
        <div style={{ flex: 1 }}>
          <p className="task-card-title">{task.title}</p>
          {task.description && (
            <p style={{ fontSize: '0.81rem', color: 'var(--txt-muted)', marginTop: '0.2rem' }}>
              {task.description}
            </p>
          )}
        </div>
        <span className={statusBadge(task.status)} style={{ marginLeft: '0.75rem', flexShrink: 0 }}>
          {task.status}
        </span>
      </div>

      {/* Meta */}
      <div className="task-card-meta">
        <span>📂 {task.projectId?.name || '—'}</span>
        <span>👤 {task.assignedTo?.name || 'Unassigned'}</span>
        {task.deadline && (
          <span style={isOverdue ? { color: 'var(--danger)', fontWeight: 600 } : {}}>
            📅 {formatDate(task.deadline)}{isOverdue ? ' ⚠️' : ''}
          </span>
        )}
        <span>⭐ {task.points} pts</span>
        {task.isApproved && <span style={{ color: 'var(--success)', fontWeight: 600 }}>✓ Approved</span>}
      </div>

      {/* Submission link (if present) */}
      {task.submissionLink && (
        <div style={{ fontSize: '0.82rem', background: 'var(--accent-light)', borderRadius: '6px', padding: '0.4rem 0.65rem' }}>
          🔗 Submission:{' '}
          <a href={task.submissionLink} target="_blank" rel="noreferrer"
            style={{ color: 'var(--accent-hover)', wordBreak: 'break-all' }}>
            {task.submissionLink}
          </a>
        </div>
      )}

      {/* Uploaded files */}
      {taskFiles.length > 0 && (
        <div style={{ fontSize: '0.82rem', background: 'var(--success-light)', borderRadius: '6px', padding: '0.4rem 0.65rem' }}>
          Files: {taskFiles.map(f => (
            <div key={f._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <a href={`http://localhost:5000/uploads/${f.filename}`} target="_blank" rel="noreferrer"
                style={{ color: 'var(--success)', wordBreak: 'break-all' }}>
                {f.filename}
              </a>
              {(user.id === f.uploadedBy._id || isLeaderOrTeacher) && (
                <button 
                  onClick={() => handleDeleteFile(f._id)}
                  style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.8rem' }}
                  title="Delete file"
                >
                  🗑
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reassign dropdown — Leader/Teacher only */}
      {isLeaderOrTeacher && members.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--txt-muted)', fontWeight: 600 }}>Assigned to:</span>
          <select
            value={task.assignedTo?._id || ''}
            onChange={(e) => onAssigneeChange && onAssigneeChange(task._id, e.target.value)}
            style={{ border: '1.5px solid var(--border)', borderRadius: '6px', padding: '0.25rem 0.5rem', fontSize: '0.8rem', background: '#fafbff', outline: 'none', cursor: 'pointer' }}
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m._id} value={m._id}>{m.name} ({m.role})</option>
            ))}
          </select>
        </div>
      )}

      {/* Actions */}
      <div className="task-card-actions">
        {/* Student: move to In Progress */}
        {isStudent && task.status === 'Pending' && (
          <button className="button button-sm button-secondary"
            onClick={() => onStatusChange && onStatusChange(task._id, 'In Progress')}>
            → In Progress
          </button>
        )}

        {/* Student: submit task */}
        {isStudent && (task.status === 'In Progress' || task.status === 'Pending') && (
          <button className="button button-sm button-outline"
            onClick={() => setShowSubmit((v) => !v)}>
            {showSubmit ? 'Cancel' : '📤 Submit Task'}
          </button>
        )}

        {/* Leader/Teacher: approve submitted task */}
        {isLeaderOrTeacher && task.status === 'Submitted' && (
          <>
            <button className="button button-sm button-success"
              onClick={() => onApprove && onApprove(task._id)}>
              ✓ Approve
            </button>
            <button className="button button-sm button-danger"
              onClick={() => onReject && onReject(task._id)}>
              ✗ Reject
            </button>
          </>
        )}

        {/* Leader/Teacher: reject approved task */}
        {isLeaderOrTeacher && task.status === 'Approved' && (
          <button className="button button-sm button-danger"
            onClick={() => onReject && onReject(task._id)}>
            ✗ Revoke Approval
          </button>
        )}

        {/* Leader/Teacher: delete */}
        {isLeaderOrTeacher && onDelete && (
          <button className="button button-sm button-danger" style={{ marginLeft: 'auto' }}
            onClick={() => onDelete(task._id)}>
            🗑 Delete
          </button>
        )}
      </div>

      {/* Submit file form (student) */}
      {showSubmit && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ flex: 1, border: '1.5px solid var(--accent)', borderRadius: '6px', padding: '0.45rem 0.7rem', fontSize: '0.85rem', outline: 'none', minWidth: '200px' }}
          />
          <button className="button button-sm" onClick={handleSubmitFile}
            disabled={!file || uploading}>
            {uploading ? 'Uploading...' : 'Submit'}
          </button>
        </div>
      )}
    </div>
  );
}

export default TaskCard;
