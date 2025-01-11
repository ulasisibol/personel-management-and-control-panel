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
    <div className="card">
      <div className="card-body">
        <h4 className="card-title mb-4">Completed Tasks</h4>
        {error && <div className="alert alert-danger">{error}</div>}
        <table className="table table-hover table-bordered">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Description</th>
              <th>Department</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>{task.id}</td>
                <td>{task.baslik}</td>
                <td>{task.aciklama}</td>
                <td>{task.departman_adi || task.departman_id}</td>
                <td>
                  {task.due_date
                    ? new Date(task.due_date).toLocaleDateString()
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tasks.length === 0 && !error && (
          <div className="alert alert-info">No completed tasks found.</div>
        )}
      </div>
    </div>
  );
};

export default ApprovedTasks;
