import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ApprovedTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCompletedTasks = async () => {
      try {
        setError('');
        const token = localStorage.getItem('token');

        // Fetch tasks with status "approved"
        const response = await axios.get('http://localhost:3000/api/tasks?status=approved', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setTasks(response.data.data || []);
      } catch (err) {
        console.error('Error fetching completed tasks:', err.message);
        setError('Error fetching completed tasks.');
      }
    };

    fetchCompletedTasks();
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem', backgroundColor: 'white' }}>
        <h4 style={{ marginBottom: '1.5rem', textAlign: 'center', fontWeight: 'bold' }}>Completed Tasks</h4>

        {error && <div className="alert alert-danger">{error}</div>}

        {tasks.length > 0 ? (
          <table className="table table-hover table-bordered" style={{ marginTop: '1rem' }}>
            <thead style={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Department</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{task.id}</td>
                  <td>{task.baslik}</td>
                  <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {task.aciklama || 'No Description'}
                  </td>
                  <td>{task.departman_adi || task.departman_id || 'N/A'}</td>
                  <td>{task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="alert alert-info text-center mt-3">
            No completed tasks found.
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovedTasks;
