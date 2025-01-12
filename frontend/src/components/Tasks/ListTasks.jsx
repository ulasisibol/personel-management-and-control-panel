import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/useAuth.js';

const TaskList = () => {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [completionNote, setCompletionNote] = useState('');

  // Fetch tasks
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
      data.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
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
  }, [user]);

  // Search tasks
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
    <div style={{ padding: '1rem' }}>
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem', backgroundColor: 'white' }}>
      <h4
     style={{
      marginBottom: "1.5rem",
      textAlign: "center",
      fontWeight: "bold",
    }}
    >Task List</h4>

        {/* Search Box */}
        <div style={{ marginBottom: '1.5rem' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div>
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '1rem',
                marginBottom: '1rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9',
              }}
            >
              {/* Task Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h6 style={{ margin: 0 }}>{task.baslik}</h6>
                  <small>{task.departman_adi || task.departman_id}</small>
                </div>
                <div>
                  <small style={{fontSize: "20px"}}>{calculateCountdown(task.due_date)}</small>
                </div>
              </div>

              {/* Task Description */}
              <div style={{ marginTop: '0.5rem', color: '#666' }}>
                <p style={{ margin: 0 }}>{task.aciklama}</p>
              </div>

              {/* Actions */}
              <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ alignSelf: 'center', backgroundColor: "#1a7f64", padding: "5px 10px 5px 10px", fontSize: "17px" }}
                  onClick={() => openCompleteModal(task.id)}
                  disabled={task.status === 'approved'}
                >
                  Complete
                </button>
              </div>
            </div>
          ))}

          {filteredTasks.length === 0 && !error && (
            <div className="alert alert-info">No tasks match the search criteria.</div>
          )}
        </div>
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
