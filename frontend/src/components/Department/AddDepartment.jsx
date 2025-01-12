import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/useAuth.js';
import { Navigate } from 'react-router-dom';

const AddDepartment = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ departmanAdi: '' });
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!user?.isSuperUser) {
    return <Navigate to="/dashboard" replace />;
  }

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/departments/list');
      setDepartments(
        response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      );
    } catch (err) {
      setError('An error occurred while loading departments.');
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

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
      setDepartments((prev) => [response.data, ...prev]);
      setFormData({ departmanAdi: '' });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
      setSuccess('');
    }
  };

  return (
    <div className="card department-card">
      <div className="card-body">
        <h4 className="card-title">Add New Department</h4>
        <form onSubmit={handleSubmit} className="form-container">
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

        <h4 className="card-title mt-4">Departments</h4>
        <div className="table-responsive">
          <table className="table table-striped">
            <thead className="table-header">
              <tr>
                <th>Department Name</th>
                <th>Creation Date</th>
                <th>Number of Employees</th>
                <th>Managers</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept.departman_id}>
                  <td>{dept.departman_adi}</td>
                  <td>{new Date(dept.created_at).toLocaleDateString()}</td>
                  <td>{dept.calisan_sayisi || 0}</td>
                  <td>
                    {dept.managers.length > 0
                      ? dept.managers.map((manager) => manager.username).join(', ')
                      : 'No Manager'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .department-card {
          color: black;
          border-radius: 10px;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
          margin: 20px;
          padding: 20px;
        }
        .card-title {
          font-weight: bold;
          text-align: center;
          margin-bottom: 20px;
        }
        .form-control {
          border: 1px solid #444;
          border-radius: 6px;
          padding: 10px;
        }
        .form-control:focus {
          outline: none;
        }
        .btn-primary {
          background-color: #1a7f64;
          border: none;
          padding: 10px 15px;
          font-weight: bold;
          border-radius: 6px;
          width: 100%;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .btn-primary:hover {
          background-color: #10a37f;
        }
        .table {
          margin-top: 20px;
        }
        .table-header {
          background: #23272a;
        }
        .table-striped tbody tr:nth-of-type(odd) {
          background: #1e2124;
        }
        .table-striped tbody tr:nth-of-type(even) {
          background: #2c2f33;
        }
        .alert {
          padding: 10px;
          margin-top: 10px;
          border-radius: 6px;
        }
        .alert-danger {
          background: #ffcccc;
          color: #990000;
        }
        .alert-success {
          background: #ccffcc;
          color: #006600;
        }
      `}</style>
    </div>
  );
};

export default AddDepartment;
