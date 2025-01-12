import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/useAuth';

const PendingTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [rejectModalTaskId, setRejectModalTaskId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [newDueDate, setNewDueDate] = useState('');

  useEffect(() => {
    if (user?.isSuperUser) {
      fetchAwaitingTasks();
    }
  }, [user]);

  const fetchAwaitingTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/tasks/pending/list', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTasks(response.data.data || []);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching tasks.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/tasks/approve',
        { taskId, approvedBy: user.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchAwaitingTasks();
    } catch (err) {
      console.error('Approval error:', err);
      alert('An error occurred while approving the task.');
    }
  };

  const handleReject = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/tasks/reject',
        {
          taskId,
          rejectedBy: user.id,
          rejectionReason: rejectReason,
          newDueDate: newDueDate || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRejectModalTaskId(null);
      setRejectReason('');
      setNewDueDate('');
      fetchAwaitingTasks();
    } catch (err) {
      console.error('Rejection error:', err);
      alert('An error occurred while rejecting the task.');
    }
  };

  if (!user?.isSuperUser) {
    return <div className="alert alert-warning">You do not have permission to view this page.</div>;
  }

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem', backgroundColor: 'white' }}>
        <h4 style={{ marginBottom: '1rem', textAlign: 'center', fontWeight: 'bold' }}>Tasks Awaiting Approval</h4>

        {loading && <div className="alert alert-info">Loading...</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        {!loading && !error && tasks.length === 0 && (
          <div className="alert alert-info text-center">No tasks awaiting approval.</div>
        )}

        {tasks.length > 0 && (
          <table className="table table-hover table-bordered mt-3">
            <thead style={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Description</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{task.id}</td>
                  <td>{task.baslik}</td>
                  <td>{task.aciklama || 'No Description'}</td>
                  <td>{task.departman_id || 'N/A'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn btn-success btn-sm me-2"
                      onClick={() => handleApprove(task.id)}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => setRejectModalTaskId(task.id)}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModalTaskId && (
        <div className="modal-backdrop">
          <div className="modal" style={{ display: 'block' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Reject Task</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setRejectModalTaskId(null)}
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="rejectReason" className="form-label">Rejection Reason</label>
                    <textarea
                      id="rejectReason"
                      className="form-control"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="newDueDate" className="form-label">New Due Date (Optional)</label>
                    <input
                      type="date"
                      className="form-control"
                      id="newDueDate"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setRejectModalTaskId(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleReject(rejectModalTaskId)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingTasks;
