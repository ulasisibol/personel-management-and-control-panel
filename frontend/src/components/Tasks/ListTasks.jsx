import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/useAuth.js';

const TaskList = () => {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  // Complete modal state
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [completionNote, setCompletionNote] = useState('');

  const fetchTasks = async () => {
    try {
      setError('');
      const token = localStorage.getItem('token');

      const response = await axios.get('http://localhost:3000/api/tasks', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let data = response.data.data || [];

      // Sort by priority (based on due_date)
      data.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

      // Remove tasks with "approved" status
      data = data.filter((task) => task.status !== 'approved');

      setTasks(data);
      setFilteredTasks(data);
    } catch (err) {
      console.error('Error fetching task list:', err.message);
      setError('An error occurred while fetching the task list.');
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = tasks.filter((task) => {
      const baslik = task.baslik?.toLowerCase() || '';
      const aciklama = task.aciklama?.toLowerCase() || '';
      const departmanAdi = task.departman_adi?.toLowerCase() || '';
      const status = task.status?.toLowerCase() || '';
      return (
        baslik.includes(query) ||
        aciklama.includes(query) ||
        departmanAdi.includes(query) ||
        status.includes(query)
      );
    });
    setFilteredTasks(filtered);
  };

  const openCompleteModal = (taskId) => {
    setSelectedTaskId(taskId);
    setCompletionNote('');
    setShowCompleteModal(true);
  };

  const closeCompleteModal = () => {
    setShowCompleteModal(false);
    setSelectedTaskId(null);
    setCompletionNote('');
  };

  const handleCompleteTask = async () => {
    try {
      if (!selectedTaskId) return;
      const token = localStorage.getItem('token');

      await axios.post(
        'http://localhost:3000/api/tasks/pending',
        {
          taskId: selectedTaskId,
          completedBy: user.id,
          completionNote: completionNote,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      closeCompleteModal();
      fetchTasks();
    } catch (err) {
      console.error('Error completing task:', err.message);
      alert('An error occurred while completing the task.');
    }
  };

  const calculateCountdown = (dueDate) => {
    if (!dueDate || isNaN(new Date(dueDate))) return 'Unknown';

    const now = new Date();
    const targetDate = new Date(dueDate);
    const diff = targetDate - now;

    if (diff <= 0) return 'Time\'s up';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <div className="card">
      <div className="card-body">
        <h4 className="card-title mb-4">Task List</h4>

        <div className="mb-3">
          <input
            type="text"
            placeholder="Search tasks..."
            className="form-control"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <table className="table table-hover table-bordered">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Description</th>
              <th>Department</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Time Left</th>
              <th>Created By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr key={task.id}>
                <td>{task.id}</td>
                <td>{task.baslik}</td>
                <td>
                  {task.status === 'rejected'
                    ? task.rejection_reason || 'No rejection reason'
                    : task.aciklama}
                </td>
                <td>{task.departman_adi || task.departman_id}</td>
                <td>{task.status}</td>
                <td>
                  {task.due_date && !isNaN(new Date(task.due_date))
                    ? new Date(task.due_date).toLocaleDateString()
                    : '-'}
                </td>
                <td>
                  {task.due_date ? calculateCountdown(task.due_date) : '-'}
                </td>
                <td>{task.assigned_by}</td>
                <td>
                  {task.status === 'open' || task.status === 'rejected' ? (
                    <button
                      className="btn btn-primary"
                      onClick={() => openCompleteModal(task.id)}
                    >
                      Complete
                    </button>
                  ) : (
                    <span>-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTasks.length === 0 && !error && (
          <div className="alert alert-info">
            No tasks match the search criteria.
          </div>
        )}
      </div>

      {/* Complete Modal */}
      {showCompleteModal && (
        <div className="modal-backdrop">
          <div className="modal" style={{ display: 'block' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Task Completion</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeCompleteModal}
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="completionNote" className="form-label">
                      Completion Note
                    </label>
                    <textarea
                      id="completionNote"
                      className="form-control"
                      value={completionNote}
                      onChange={(e) => setCompletionNote(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={closeCompleteModal}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleCompleteTask}
                  >
                    Submit
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

export default TaskList;
