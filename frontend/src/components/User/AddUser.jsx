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

  // User form data
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    isSuperUser: true,
    departmentId: '',
    personnelId: ''
  });

  // Departments, Personnel, Users
  const [departments, setDepartments] = useState([]);
  const [personnelList, setPersonnelList] = useState([]);
  const [users, setUsers] = useState([]);

  // Messages
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 1) Fetch departments
  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/departments/list', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setDepartments(response.data);
    } catch (err) {
      setError('An error occurred while loading departments.');
    }
  };

  // 2) Fetch personnel
  const fetchPersonnel = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/personnel', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Personnel Data:', response.data); // Print data to console
      setPersonnelList(response.data);
    } catch (err) {
      setError('An error occurred while loading personnel list.');
    }
  };

  // 3) Fetch users
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/auth/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUsers(response.data);
    } catch (err) {
      setError('An error occurred while loading users.');
    }
  };

  // On initial page load, fetch department, personnel, and user lists
  useEffect(() => {
    fetchDepartments();
    fetchPersonnel();
    fetchUsers();
  }, []);

  // If department selected manually, remove admin rights
  useEffect(() => {
    if (formData.departmentId) {
      setFormData(prev => ({ ...prev, isSuperUser: false }));
    } else {
      setFormData(prev => ({ ...prev, isSuperUser: true }));
    }
  }, [formData.departmentId]);

  // Personnel options (React-Select)
  const personnelOptions = personnelList.map((p) => ({
    value: p.personnel_id,
    label: `${p.first_name} ${p.last_name}`,
    departmentId: p.department_id, // Department ID
    departmentName: p.department_name // Department Name
  }));

  // When personnel selected, auto-fill department
  const handlePersonnelChange = (selectedOption) => {
    if (selectedOption) {
      const { value: personnelId, departmentId } = selectedOption;
      setFormData((prev) => ({
        ...prev,
        personnelId,
        departmentId: departmentId || '', // Assign department ID
        isSuperUser: false // If department exists, not admin
      }));
    } else {
      // If personnel selection cleared
      setFormData((prev) => ({
        ...prev,
        personnelId: '',
        departmentId: '',
        isSuperUser: true
      }));
    }
  };

  // Department Options
  const departmentOptions = departments.map(d => ({
    value: d.departman_id,
    label: d.departman_adi
  }));

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/auth/register', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSuccess('User created successfully');

      // Reset form
      setFormData({
        username: '',
        password: '',
        isSuperUser: true,
        departmentId: '',
        personnelId: ''
      });

      // Update list
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <h4 className="card-title mb-4">Add New User</h4>

        <form onSubmit={handleSubmit}>
          {/* Username */}
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

          {/* Password */}
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

          {/* Personnel Selection */}
          <div className="mb-3">
            <label className="form-label">Select Personnel (Optional)</label>
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

          {/* Department Selection */}
          <div className="mb-3">
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

          {/* Admin Rights (read-only) */}
          <div className="mb-4">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="isSuperUser"
                checked={formData.isSuperUser}
                readOnly
              />
              <label className="form-check-label" htmlFor="isSuperUser">
                Admin Rights
              </label>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && <div className="alert alert-danger mb-3">{error}</div>}
          {success && <div className="alert alert-success mb-3">{success}</div>}

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary">
            Create User
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
