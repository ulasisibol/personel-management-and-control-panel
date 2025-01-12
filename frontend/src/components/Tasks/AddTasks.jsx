import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/useAuth';

const AddTasks = () => {
  const { user } = useAuth();

  const [baslik, setBaslik] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [departmanId, setDepartmanId] = useState(user?.department?.departman_id || '');
  const [dueDate, setDueDate] = useState('');
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/departments/list', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDepartments(response.data);
      } catch (err) {
        console.error('Failed to fetch departments:', err);
        setError('Failed to load departments.');
      }
    };

    if (user?.isSuperUser) {
      fetchDepartments();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    try {
      await axios.post(
        '/api/tasks/create',
        {
          baslik,
          aciklama,
          departman_id: departmanId,
          assigned_by: user.id,
          due_date: dueDate || null,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setSuccessMsg('Task created successfully!');
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
    <div style={{ padding: '1rem' }}>
      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '2rem',
          backgroundColor: 'white',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h4 style={{ marginBottom: '1rem', textAlign: 'center', fontWeight: 'bold' }}>Add New Task</h4>

        {error && <div className="alert alert-danger">{error}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        <form onSubmit={handleSubmit}>
          {/* Task Title */}
          <div className="mb-3">
            <label htmlFor="baslik" className="form-label">
              Title
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

          {/* Task Description */}
          <div className="mb-3">
            <label htmlFor="aciklama" className="form-label">
              Description
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

          {/* Department */}
          <div className="mb-3">
            <label htmlFor="departmanId" className="form-label">
              Department
            </label>
            {user?.isSuperUser ? (
              <select
                id="departmanId"
                className="form-select"
                value={departmanId}
                onChange={(e) => setDepartmanId(e.target.value)}
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.departman_id} value={dept.departman_id}>
                    {dept.departman_adi}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                className="form-control"
                value={user?.department?.departman_adi || 'No Department'}
                readOnly
              />
            )}
          </div>

          {/* Due Date */}
          <div className="mb-3">
            <label htmlFor="dueDate" className="form-label">
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              className="form-control"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <div className="d-grid">
            <button
              type="submit"
              className="btn btn-primary"
              
              style={{ fontWeight: 'bold', padding: '0.5rem', backgroundColor: "#1a7f64" }}
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTasks;
