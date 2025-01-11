/**
 * ./src/components/tasks/PendingTasks.jsx
 */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/useAuth';

const PendingTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // We keep track of which task was clicked for rejection
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
      // Endpoint: GET /api/tasks/pending/list
      const response = await axios.get('/api/tasks/pending/list');
      // Expected response: { success: true, data: [...] }
      setTasks(response.data.data || []);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (taskId) => {
    try {
      // POST /api/tasks/approve
      await axios.post('/api/tasks/approve', {
        taskId,
        approvedBy: user.id
      });
      // Refresh the list
      fetchAwaitingTasks();
    } catch (err) {
      console.error('handleApprove error:', err);
      alert('An error occurred while approving the task');
    }
  };

  const handleReject = async (taskId) => {
    try {
      // POST /api/tasks/reject
      await axios.post('/api/tasks/reject', {
        taskId,
        rejectedBy: user.id,
        rejectionReason: rejectReason,
        newDueDate: newDueDate || null
      });
      // Close modal
      setRejectModalTaskId(null);
      setRejectReason('');
      setNewDueDate('');
      // Refresh the list
      fetchAwaitingTasks();
    } catch (err) {
      console.error('handleReject error:', err);
      alert('An error occurred while rejecting the task');
    }
  };

  if (!user?.isSuperUser) {
    return <div>You do not have permission to view this page.</div>;
  }

  return (
    <div>
      <h2>Tasks Awaiting Approval</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && tasks.length === 0 && (
        <p>No tasks awaiting approval.</p>
      )}

      <table className="table table-bordered table-striped mt-3">
        <thead>
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
              <td>{task.id}</td>
              <td>{task.baslik}</td>
              <td>{task.aciklama}</td>
              <td>{task.departman_id}</td>
              <td>
                <button
                  className="btn btn-success me-2"
                  onClick={() => handleApprove(task.id)}
                >
                  Approve
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => setRejectModalTaskId(task.id)}
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
                    <label htmlFor="rejectReason" className="form-label">
                      Rejection Reason
                    </label>
                    <textarea
                      className="form-control"
                      id="rejectReason"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="newDueDate" className="form-label">
                      New Due Date (Optional)
                    </label>
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
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setRejectModalTaskId(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
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
