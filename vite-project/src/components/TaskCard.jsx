import { useState } from 'react';

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
  const [link, setLink]             = useState(task.submissionLink || '');

  const handleSubmitLink = () => {
    if (!link.trim()) return;
    onSubmit && onSubmit(task._id, link.trim());
    setShowSubmit(false);
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

      {/* Submit link form (student) */}
      {showSubmit && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://github.com/your-submission"
            style={{ flex: 1, border: '1.5px solid var(--accent)', borderRadius: '6px', padding: '0.45rem 0.7rem', fontSize: '0.85rem', outline: 'none', minWidth: '200px' }}
          />
          <button className="button button-sm" onClick={handleSubmitLink}
            disabled={!link.trim()}>
            Submit
          </button>
        </div>
      )}
    </div>
  );
}

export default TaskCard;
