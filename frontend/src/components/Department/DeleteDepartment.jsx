import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/useAuth.js';
import { Navigate } from 'react-router-dom';

const DeleteDepartment = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Admin check
  if (!user?.isSuperUser) {
    return <Navigate to="/dashboard" replace />;
  }

  // List departments
  const fetchDepartments = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/departments/list');
      setDepartments(response.data);
    } catch (err) {
      setError('An error occurred while loading departments.');
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleDelete = async (departmentId) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3000/api/departments/delete/${departmentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSuccess('Department deleted successfully.');
        fetchDepartments(); // Update departments
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred.');
        setSuccess('');
      }
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <h4 className="card-title mb-4">Delete Departments</h4>
        {error && <div className="alert alert-danger mb-3">{error}</div>}
        {success && <div className="alert alert-success mb-3">{success}</div>}
        <table className="table">
          <thead>
            <tr>
              <th>Department Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr key={dept.departman_id}>
                <td>{dept.departman_adi}</td>
                <td>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(dept.departman_id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeleteDepartment;
