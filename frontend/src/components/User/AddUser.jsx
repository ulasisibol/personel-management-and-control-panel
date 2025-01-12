import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth.js';
import Select from 'react-select';

const AddUser = () => {
  const { user } = useAuth();

  // Only superusers can access
  if (!user?.isSuperUser) {
    return <Navigate to="/dashboard" replace />;
  }

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    isSuperUser: true,
    departmentId: '',
    personnelId: '',
  });

  const [departments, setDepartments] = useState([]);
  const [personnelList, setPersonnelList] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/departments/list', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDepartments(response.data);
      } catch (err) {
        setError('An error occurred while loading departments.');
      }
    };

    const fetchPersonnel = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/personnel', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPersonnelList(response.data);
      } catch (err) {
        setError('An error occurred while loading personnel list.');
      }
    };

    fetchDepartments();
    fetchPersonnel();
  }, []);

  const handlePersonnelChange = (selectedOption) => {
    if (selectedOption) {
      const { value: personnelId, departmentId } = selectedOption;
      setFormData((prev) => ({
        ...prev,
        personnelId,
        departmentId: departmentId || '',
        isSuperUser: false,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        personnelId: '',
        departmentId: '',
        isSuperUser: true,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/auth/register', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccess('User created successfully');
      setFormData({
        username: '',
        password: '',
        isSuperUser: true,
        departmentId: '',
        personnelId: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  const personnelOptions = personnelList.map((p) => ({
    value: p.personnel_id,
    label: `${p.first_name} ${p.last_name}`,
    departmentId: p.department_id,
  }));

  const departmentOptions = departments.map((d) => ({
    value: d.departman_id,
    label: d.departman_adi,
  }));

  return (
    <div className="card user-add-card">
             
      <div className="card-body">
      <h4
     style={{
      marginBottom: "1.5rem",
      textAlign: "center",
      fontWeight: "bold",
    }}
    >Add User</h4>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Select Personnel</label>
            <Select
              options={personnelOptions}
              isClearable={true}
              placeholder="Search or select personnel"
              value={
                formData.personnelId
                  ? personnelOptions.find((opt) => opt.value === formData.personnelId)
                  : null
              }
              onChange={handlePersonnelChange}
            />
          </div>
          <div>
            <span>
              <p>If you do not select personnel, you create an administrator user!</p>
            </span>
          </div>
          <div className="mb-5">
            <label className="form-label">Department</label>
            <select
              className="form-select"
              value={formData.departmentId}
              onChange={(e) =>
                setFormData({ ...formData, departmentId: e.target.value })
              }
              disabled={!!formData.personnelId}
              required
            >
              <option value="">Select Department</option>
              {departmentOptions.map((dept) => (
                <option key={dept.value} value={dept.value}>
                  {dept.label}
                </option>
              ))}
            </select>
          </div>
          
          {error && <div className="alert alert-danger mb-3">{error}</div>}
          {success && <div className="alert alert-success mb-3">{success}</div>}
          <button type="submit" className="btn btn-primary">
            Create User
          </button>
        </form>
      </div>
      <style jsx>{`
        .user-add-card {

          color: black;
          border-radius: 10px;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
          margin: 20px;
          padding: 20px;
        }
        .card-title {
          text-align: center;
        }
        .form-control,
        .form-select {
          border: 1px solid #444;
          border-radius: 6px;
          padding: 10px;
        }
        .form-control:focus,
        .form-select:focus {
          outline: none;
        }
        .btn-primary {
          background-color: #1a7f64;
          border: none;
          color: #fff;
          padding: 10px 15px;
          font-size: 16px;
          font-weight: bold;
          border-radius: 5px;
          width: 100%;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .btn-primary:hover {
          background-color: #10a37f;
        }
        .form-label {
          margin-bottom: 5px;
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

export default AddUser;
