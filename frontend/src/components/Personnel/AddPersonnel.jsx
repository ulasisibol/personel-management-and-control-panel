import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/useAuth.js';

const AddPersonnel = () => {
  const { user } = useAuth();
  const initialDepartmentId = user?.departmentId || '';
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    job_title: '',
    department_id: initialDepartmentId,
    email: '',
    phone: '',
    address: '',
    hire_date: '',
    salary: '',
    photo: null,
  });

  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/departments/list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDepartments(response.data);
    } catch (err) {
      setError('An error occurred while loading departments.');
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      photo: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const formDataObject = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) formDataObject.append(key, formData[key]);
      });

      await axios.post('http://localhost:3000/api/personnel/add', formDataObject, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess('Personnel added successfully.');
      setFormData({
        first_name: '',
        last_name: '',
        job_title: '',
        department_id: user?.departmentId || '',
        email: '',
        phone: '',
        address: '',
        hire_date: '',
        salary: '',
        photo: null,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while adding personnel.');
    }
  };

  const isAdmin = user?.isSuperUser;
  const isDepartmentFixed = !!user?.departmentId && !isAdmin;

  return (
    <div className="container mt-4" >
      <div className="card personnel-card">
        <div className="card-body">
        <h4
     style={{
      marginBottom: "1.5rem",
      textAlign: "center",
      fontWeight: "bold",
    }}
    >Add New Personnel</h4>
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Phone</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Department</label>
                <select
                  className="form-select"
                  value={formData.department_id}
                  onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                  required
                  disabled={isDepartmentFixed}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.departman_id} value={dept.departman_id}>
                      {dept.departman_adi}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Job Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-12">
                <label className="form-label">Address</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Hire Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.hire_date}
                  onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Salary</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-12">
                <label className="form-label">Profile Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {error && <div className="alert alert-danger mt-3">{error}</div>}
            {success && <div className="alert alert-success mt-3">{success}</div>}

            <button type="submit" className="btn btn-primary mt-3 w-100">
              Add Personnel
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .personnel-card {
          background-color: #f8f9fa;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .form-label {
          font-weight: bold;
        }
        .form-control {
          border: 1px solid #ccc;
          border-radius: 5px;
          padding: 0.5rem;
        }
        .btn-primary {
          background-color: #1a7f64;
          border: none;
          color: #fff;
          padding: 10px;
          font-size: 16px;
          font-weight: bold;
          border-radius: 5px;
          width: 80%;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .btn-primary:hover {
          background-color: #10a37f;
        }
      `}</style>
    </div>
  );
};

export default AddPersonnel;
