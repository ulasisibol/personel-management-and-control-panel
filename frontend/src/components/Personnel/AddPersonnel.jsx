import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/useAuth.js';

const AddPersonnel = () => {
  // 1) We get the user information from the Auth context
  const { user } = useAuth();

  // 2) The user's department ID (if null/undefined then '', i.e., empty)
  //    In this example, we use the name user.departmentId (camelCase).
  const initialDepartmentId = user?.departmentId || '';

  // 3) Form data (using snake_case according to the database field names)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    job_title: '',
    department_id: initialDepartmentId,  // <-- We set the Department ID here
    email: '',
    phone: '',
    address: '',
    hire_date: '',
    salary: '',
    photo: null, // File (image)
  });

  // 4) Departments (to be fetched from the API)
  const [departments, setDepartments] = useState([]);

  // 5) Error and success messages
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 6) Fetch the list of departments
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

  // 7) When the page loads, fetch the departments
  useEffect(() => {
    fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 8) Handle photo (file) selection
  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      photo: e.target.files[0],
    }));
  };

  // 9) When submitting the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');

      // Create FormData object
      const formDataObject = new FormData();
      formDataObject.append('first_name', formData.first_name);
      formDataObject.append('last_name', formData.last_name);
      formDataObject.append('job_title', formData.job_title);
      formDataObject.append('department_id', formData.department_id);
      formDataObject.append('email', formData.email);
      formDataObject.append('phone', formData.phone);
      formDataObject.append('address', formData.address);
      formDataObject.append('hire_date', formData.hire_date);
      formDataObject.append('salary', formData.salary);

      // If there is a photo, add it
      if (formData.photo) {
        formDataObject.append('photo', formData.photo);
      }

      // Send to API (personnel/add)
      await axios.post('http://localhost:3000/api/personnel/add', formDataObject, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess('Personnel added successfully.');

      // Reset the form
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
      console.error('Error adding personnel:', err);
      setError(err.response?.data?.message || 'An error occurred while adding personnel.');
    }
  };

  // 10) Is the user an admin? (user.isSuperUser => true/false)
  const isAdmin = user?.isSuperUser;

  // 11) If the user is not an admin (normal user) and has a departmentId, they should not be able to change the department
  const isDepartmentFixed = !!user?.departmentId && !isAdmin;

  return (
    <div className="container mt-4">
      <div className="card mb-4">
        <div className="card-body">
          <h4 className="card-title mb-4">Add New Personnel</h4>

          {/* Form Start */}
          <form onSubmit={handleSubmit}>
            {/* First Name and Last Name */}
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

            {/* Email and Phone */}
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

            {/* Department and Job Title */}
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Department</label>
                <select
                  className="form-select"
                  value={formData.department_id}
                  onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                  required
                  disabled={isDepartmentFixed} // Normal user cannot change department
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

            {/* Address */}
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

            {/* Hire Date and Salary */}
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

            {/* Profile Photo */}
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

            {/* Messages */}
            {error && <div className="alert alert-danger mt-3">{error}</div>}
            {success && <div className="alert alert-success mt-3">{success}</div>}

            {/* Submit Button */}
            <button type="submit" className="btn btn-primary mt-3">
              Add Personnel
            </button>
          </form>
          {/* Form End */}
        </div>
      </div>
    </div>
  );
};

export default AddPersonnel;
