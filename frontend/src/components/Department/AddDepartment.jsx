import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/useAuth.js';
import { Navigate } from 'react-router-dom';

const AddDepartment = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ departmanAdi: '' });
  const [departments, setDepartments] = useState([]); // All departments
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Admin check
  if (!user?.isSuperUser) {
    return <Navigate to="/dashboard" replace />;
  }

  // List all departments
  const fetchDepartments = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/departments/list');
      setDepartments(
        response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // Sort by date (newest to oldest)
      );
    } catch (err) {
      setError('An error occurred while loading departments.');
    }
  };

  // Get department list when page loads
  useEffect(() => {
    fetchDepartments();
  }, []);

  // Add new department
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3000/api/departments/create',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess('Department created successfully');
      setDepartments((prev) => [response.data, ...prev]); // Add new department to the list
      setFormData({ departmanAdi: '' });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
      setSuccess('');
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <h4 className="card-title mb-4">Add New Department</h4>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Department Name</label>
            <input
              type="text"
              className="form-control"
              value={formData.departmanAdi}
              onChange={(e) => setFormData({ ...formData, departmanAdi: e.target.value })}
              required
            />
          </div>
          {error && <div className="alert alert-danger mb-3">{error}</div>}
          {success && <div className="alert alert-success mb-3">{success}</div>}
          <button type="submit" className="btn btn-primary">
            Create Department
          </button>
        </form>

        {/* All Departments */}
        <h4 className="card-title mt-4">Departments</h4>
        <table className="table">
          <thead>
            <tr>
              <th>Department Name</th>
              <th>Creation Date</th>
              <th>Number of Employees</th>
              <th>Managers</th>
            </tr>
          </thead>
          <tbody>
            {departments.map(dept => (
              <tr key={dept.departman_id}>
                <td>{dept.departman_adi}</td>
                <td>{new Date(dept.created_at).toLocaleDateString()}</td>
                <td>{dept.calisan_sayisi}</td>
                <td>
                  {dept.managers.length > 0
                    ? dept.managers.map(manager => manager.username).join(', ')
                    : 'No Manager'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AddDepartment;
