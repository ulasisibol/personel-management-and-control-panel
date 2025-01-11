// src/components/Personnel/UpdatePersonnel.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/useAuth';

const UpdatePersonnel = () => {
  const { user } = useAuth();
  const [personnelList, setPersonnelList] = useState([]);
  const [selectedPersonnel, setSelectedPersonnel] = useState(null); // Person to be updated
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // 1) Fetch personnel
  const fetchPersonnel = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/personnel', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPersonnelList(response.data);
    } catch (err) {
      setError('An error occurred while fetching the personnel list.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonnel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) When Edit button is clicked, set the selected personnel to state
  const handleEdit = (person) => {
    setSelectedPersonnel({ ...person }); // take a copy
    setSuccess('');
    setError('');
  };

  // 3) On form submit => PUT request
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedPersonnel) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const personnelId = selectedPersonnel.personnel_id;

      await axios.put(`http://localhost:3000/api/personnel/update/${personnelId}`, {
        first_name: selectedPersonnel.first_name,
        last_name: selectedPersonnel.last_name,
        job_title: selectedPersonnel.job_title,
        department_id: selectedPersonnel.department_id,
        manager_id: null, // Include manager_id if desired
        email: selectedPersonnel.email,
        phone: selectedPersonnel.phone,
        address: selectedPersonnel.address,
        hire_date: selectedPersonnel.hire_date,
        salary: selectedPersonnel.salary,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess('Personnel updated successfully.');
      setError('');

      // Refresh list after update
      fetchPersonnel();
      // Reset form
      setSelectedPersonnel(null);
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.message || 'An error occurred during update.');
    } finally {
      setLoading(false);
    }
  };

  // 4) Update state when form fields change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedPersonnel((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="container mt-4">
      <h3>Update Personnel</h3>

      {loading && <div>Loading...</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Personnel list */}
      <div className="mb-4">
        <h5>Personnel you can view</h5>
        {personnelList.map((person) => (
          <div key={person.personnel_id} className="border p-2 mb-2">
            <strong>{person.first_name} {person.last_name}</strong> - {person.department_name || 'No Department'}
            <button
              className="btn btn-sm btn-primary ms-3"
              onClick={() => handleEdit(person)}
            >
              Edit
            </button>
          </div>
        ))}
        {personnelList.length === 0 && (
          <div className="alert alert-info">No personnel found.</div>
        )}
      </div>

      {/* Edit Form (shown if a personnel is selected) */}
      {selectedPersonnel && (
        <div className="card">
          <div className="card-body">
            <h5>Edit Personnel</h5>
            <form onSubmit={handleUpdate}>
              <div className="mb-2">
                <label>First Name</label>
                <input
                  className="form-control"
                  name="first_name"
                  value={selectedPersonnel.first_name || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-2">
                <label>Last Name</label>
                <input
                  className="form-control"
                  name="last_name"
                  value={selectedPersonnel.last_name || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-2">
                <label>Email</label>
                <input
                  className="form-control"
                  name="email"
                  value={selectedPersonnel.email || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-2">
                <label>Phone</label>
                <input
                  className="form-control"
                  name="phone"
                  value={selectedPersonnel.phone || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-2">
                <label>Department ID</label>
                <input
                  type="number"
                  className="form-control"
                  name="department_id"
                  value={selectedPersonnel.department_id || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-2">
                <label>Job Title</label>
                <input
                  className="form-control"
                  name="job_title"
                  value={selectedPersonnel.job_title || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-2">
                <label>Address</label>
                <input
                  className="form-control"
                  name="address"
                  value={selectedPersonnel.address || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-2">
                <label>Hire Date</label>
                <input
                  type="date"
                  className="form-control"
                  name="hire_date"
                  value={selectedPersonnel.hire_date ? selectedPersonnel.hire_date.slice(0,10) : ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-2">
                <label>Salary</label>
                <input
                  type="number"
                  className="form-control"
                  name="salary"
                  value={selectedPersonnel.salary || ''}
                  onChange={handleInputChange}
                />
              </div>

              <button type="submit" className="btn btn-success mt-2">
                Update
              </button>
              <button
                type="button"
                className="btn btn-secondary mt-2 ms-2"
                onClick={() => setSelectedPersonnel(null)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdatePersonnel;
