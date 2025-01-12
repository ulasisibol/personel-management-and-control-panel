import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/useAuth';

const UpdatePersonnel = () => {
  const { user } = useAuth();
  const [personnelList, setPersonnelList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // Number of items per page
  const [selectedPersonnel, setSelectedPersonnel] = useState(null);

  // Fetch personnel list
  const fetchPersonnel = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/personnel', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPersonnelList(response.data);
    } catch (err) {
      setError('An error occurred while fetching the personnel list.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch department list
  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/departments/list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDepartments(response.data);
    } catch (err) {
      setError('Failed to fetch departments.');
    }
  };

  useEffect(() => {
    fetchPersonnel();
    fetchDepartments();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page
  };

  // Handle edit button click
  const handleEdit = (person) => {
    setSelectedPersonnel({ ...person });
    setSuccess('');
    setError('');
  };

  // Handle update form submission
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedPersonnel) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const personnelId = selectedPersonnel.personnel_id;

      await axios.put(
        `http://localhost:3000/api/personnel/update/${personnelId}`,
        {
          first_name: selectedPersonnel.first_name,
          last_name: selectedPersonnel.last_name,
          job_title: selectedPersonnel.job_title,
          department_id: selectedPersonnel.department_id,
          email: selectedPersonnel.email,
          phone: selectedPersonnel.phone,
          address: selectedPersonnel.address,
          hire_date: selectedPersonnel.hire_date,
          salary: selectedPersonnel.salary,
          is_active: selectedPersonnel.is_active, // Include active status
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess('Personnel updated successfully.');
      fetchPersonnel();
      setSelectedPersonnel(null);
    } catch (err) {
      setError('An error occurred during the update.');
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedPersonnel((prev) => ({ ...prev, [name]: value }));
  };

  // Filter personnel by search query
  const filteredPersonnel = personnelList.filter((person) => {
    const fullName = `${person.first_name} ${person.last_name}`.toLowerCase();
    const department = person.department_name?.toLowerCase() || '';
    return (
      fullName.includes(searchQuery) ||
      department.includes(searchQuery) ||
      person.job_title.toLowerCase().includes(searchQuery)
    );
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPersonnel.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPersonnel.length / itemsPerPage);

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem', backgroundColor: 'white' }}>
      <h4
     style={{
      marginBottom: "1.5rem",
      textAlign: "center",
      fontWeight: "bold",
    }}
    >Update Personnel</h4>

        {/* Search Box */}
        <div style={{ marginBottom: '1.5rem' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search personnel..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div>
        {currentItems.map((person) => (
  <div
    key={person.personnel_id}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem',
      marginBottom: '1rem',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9',
      cursor: 'pointer',
    }}
  >
    {/* Name and Title */}
    <div>
      <h6 style={{ margin: 0 }}>
        {person.first_name} {person.last_name}
      </h6>
      <small>{person.job_title}</small>
    </div>

    {/* Edit Button - Only visible if not editing the current person */}
    {selectedPersonnel?.personnel_id !== person.personnel_id && (
      <button
        className="btn btn-sm btn-primary"
        style={{ alignSelf: 'center', backgroundColor: "#1a7f64", padding: "5px 10px 5px 10px", fontSize: "17px" }}
        onClick={() => handleEdit(person)}
      >
        Edit
      </button>
    )}

    {/* Inline Edit Form */}
    {selectedPersonnel?.personnel_id === person.personnel_id && (
      <div style={{ marginTop: '1rem', width: '100%' }}>
        <form onSubmit={handleUpdate}>
          {/* First Name */}
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

          {/* Last Name */}
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

          {/* Job Title */}
          <div className="mb-2">
            <label>Job Title</label>
            <input
              className="form-control"
              name="job_title"
              value={selectedPersonnel.job_title || ''}
              onChange={handleInputChange}
            />
          </div>

          {/* Department */}
          <div className="mb-2">
            <label>Department</label>
            <select
              className="form-select"
              name="department_id"
              value={selectedPersonnel.department_id || ''}
              onChange={handleInputChange}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.departman_id} value={dept.departman_id}>
                  {dept.departman_adi}
                </option>
              ))}
            </select>
          </div>

          {/* Email */}
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

          {/* Phone */}
          <div className="mb-2">
            <label>Phone</label>
            <input
              className="form-control"
              name="phone"
              value={selectedPersonnel.phone || ''}
              onChange={handleInputChange}
            />
          </div>

          {/* Address */}
          <div className="mb-2">
            <label>Address</label>
            <input
              className="form-control"
              name="address"
              value={selectedPersonnel.address || ''}
              onChange={handleInputChange}
            />
          </div>

          {/* Hire Date */}
          <div className="mb-2">
            <label>Hire Date</label>
            <input
              type="date"
              className="form-control"
              name="hire_date"
              value={
                selectedPersonnel.hire_date
                  ? selectedPersonnel.hire_date.slice(0, 10)
                  : ''
              }
              onChange={handleInputChange}
            />
          </div>

          {/* Salary */}
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

          {/* Is Active */}
          <div className="mb-2">
            <label>Status</label>
            <select
              className="form-select"
              name="is_active"
              value={selectedPersonnel.is_active || ''}
              onChange={handleInputChange}
            >
              <option value="">Select Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          {/* Action Buttons */}
          <button type="submit" className="btn btn-success mt-2">
            Save Changes
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
    )}
  </div>
))}


          {filteredPersonnel.length === 0 && (
            <div className="alert alert-info">No personnel found matching the search criteria.</div>
          )}
        </div>

        {/* Pagination */}
        {filteredPersonnel.length > itemsPerPage && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
            <button
              className="btn btn-secondary btn-sm me-2"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              className="btn btn-secondary btn-sm ms-2"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdatePersonnel;
