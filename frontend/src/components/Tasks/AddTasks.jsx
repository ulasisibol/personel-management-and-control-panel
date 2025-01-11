import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/useAuth';

const AddTasks = () => {
  const { user } = useAuth();

  // Form fields
  const [baslik, setBaslik] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [departmanId, setDepartmanId] = useState(user?.department?.departman_id || '');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    try {
      // POST /api/tasks/create
      await axios.post('/api/tasks/create', {
        baslik,
        aciklama,
        departman_id: departmanId,
        assigned_by: user.id, // User who created the task
        due_date: dueDate || null
      });
      setSuccessMsg('Task created successfully!');
      // Reset the form
      setBaslik('');
      setAciklama('');
      setDepartmanId(user?.department?.departman_id || '');
      setDueDate('');
    } catch (err) {
      console.error('Task creation error:', err);
      setError(err.response?.data?.error || 'An error occurred while creating the task');
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div className="card-header bg-dark text-white">
          <h3 className="mb-0">Add Task</h3>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          {successMsg && <div className="alert alert-success">{successMsg}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="baslik" className="form-label">
                <strong>Title</strong>
              </label>
              <input
                type="text"
                id="baslik"
                className="form-control"
                placeholder="Enter task title"
                value={baslik}
                onChange={(e) => setBaslik(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="aciklama" className="form-label">
                <strong>Description</strong>
              </label>
              <textarea
                id="aciklama"
                className="form-control"
                placeholder="Enter task description"
                value={aciklama}
                onChange={(e) => setAciklama(e.target.value)}
                rows={3}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="departmanId" className="form-label">
                <strong>Department ID</strong>
              </label>
              <input
                type="number"
                id="departmanId"
                className="form-control"
                value={departmanId}
                onChange={(e) => setDepartmanId(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="dueDate" className="form-label">
                <strong>Due Date</strong>
              </label>
              <input
                type="date"
                id="dueDate"
                className="form-control"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="d-grid">
              <button type="submit" className="btn btn-primary">
                Create Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTasks;
