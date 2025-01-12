import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/useAuth.js';
import { Navigate } from 'react-router-dom';

const DeleteDepartment = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!user?.isSuperUser) {
    return <Navigate to="/dashboard" replace />;
  }

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
        fetchDepartments();
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred.');
        setSuccess('');
      }
    }
  };

  return (
    <div className="card department-delete-card">
      <div className="card-body">
        <h4 className="card-title">Delete Departments</h4>
        {error && <div className="alert alert-danger mb-3">{error}</div>}
        {success && <div className="alert alert-success mb-3">{success}</div>}
        <div className="table-responsive">
          <table className="table table-striped">
            <thead className="table-header">
              <tr>
                <th>Department Name</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept.departman_id}>
                  <td>{dept.departman_adi}</td>
                  <td className="text-end">
                    <button
                      className="btn btn-danger btn-sm"
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

      <style jsx>{`
        .department-delete-card {
          color: black;
          border-radius: 10px;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
          margin: 20px;
          padding: 20px;
        }
        .card-title {
          font-weight: bold;
          text-align: center;
        }
        .table {
          margin-top: 20px;
        }
        .table-header {
          background: #23272a;
          color: #ffffff;
        }
        .table-striped tbody tr:nth-of-type(odd) {
          background: #f9f9f9;
        }
        .table-striped tbody tr:nth-of-type(even) {
          background: #ffffff;
        }
        .btn-danger {
          background-color: #1a7f64;
          border: none;
          color: #fff;
          padding: 5px;
          font-size: 16px;
          font-weight: bold;
          border-radius: 5px;
          width: 80%;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .btn-danger:hover {
          background-color: #10a37f;
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
        .text-end {
          text-align: center !important;
        }
      `}</style>
    </div>
  );
};

export default DeleteDepartment;
